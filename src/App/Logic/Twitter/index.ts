import {inject, injectable} from "inversify";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IUserRepository} from "../../../Data/Interfaces/Repositories/IUserRepository";
import TwitterSDK from "twitter-api-v2";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {ITweetRepository} from "../../../Data/Interfaces/Repositories/ITweetRepository";
import {Tweet} from "../../../Data/Entities/Tweet";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {cacheTweeterUser, getUserFromRealID, removeDubleRegisterUser} from "../../../helpers/functions";
import {IReportRepository} from "../../../Data/Interfaces/Repositories/IReportRepository";
import {Report} from "../../../Data/Entities/Report";
import * as fs from "fs";
import path from "path";

const client = new TwitterSDK({
    clientId: process.env.TWITTER_CID,
    clientSecret: process.env.TWITTER_SECRET
});


@injectable()
export class Twitter {
    @inject(DataTypes.IUserRepository) private _userRepository: IUserRepository;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(DataTypes.ITweetRepository) private _tweetRepository: ITweetRepository;
    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(DataTypes.IReportRepository) _reportRepository: IReportRepository;

    async generateAuthLink(userEmail: string, redirectURI: string): Promise<BaseAppResult<any>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<boolean | string>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let authLink = client.generateOAuth2AuthLink(redirectURI, {
                scope: ['tweet.write', 'tweet.read', 'offline.access', 'users.read']
            });

            let tweeterID = this._idService.generate();
            await this._userRepository.addTwitter(userEmail, {
                refreshToken: null,
                token: null,
                codeVerifier: authLink.codeVerifier,
                state: authLink.state,
                twitterId: tweeterID,
                isActivated: true,
                tweeterRealID: null,
                redirectURL: redirectURI
            });

            return new BaseAppResult<any>(
                {
                    url: authLink.url,
                    tweeterID
                },
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }


    async verifyTwitter(code: string, state: string): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findUserByTweeterState(state);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let resultT;
            try {
                resultT = await client.loginWithOAuth2({
                    redirectUri: user.data.twitters.find(t => t.state == state)?.redirectURL as string,
                    codeVerifier: user.data.twitters.find(t => t.state == state)?.codeVerifier as string,
                    code: code as string
                });
            } catch (e) {
                console.log(e);
                return new BaseAppResult<boolean>(false, true, '', ResultStatus.Invalid);
            }

            let {
                refreshToken,
                accessToken,
                client: twcl
            } = await client.refreshOAuth2Token(resultT.refreshToken);

            const profileData = await twcl.v2.me({"user.fields": ["name", "id", "profile_image_url", "username"]});
            let id = profileData.data.id;

            await removeDubleRegisterUser(this._userRepository, id);
            let r = await this._userRepository.updateTweeterObject(user.data.email, {
                refreshToken: refreshToken,
                token: accessToken,
                codeVerifier: code,
                state: state,
                twitterId: user.data.twitters.find(t => t.state == state)?.twitterId as string,
                isActivated: true,
                tweeterRealID: id,
                redirectURL: user.data.twitters.find(t => t.state == state)?.redirectURL as string
            });

            return new BaseAppResult<boolean>(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }


    async tweet(userEmail: string, tweeterID: string, content: string, img?: string): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let tweeter = user.data.twitters.find(t => t.twitterId == tweeterID);
            if (!tweeter) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweeter not found",
                    ResultStatus.NotFound
                );
            }
            const {
                refreshToken,
                accessToken,
                client: twcl
            } = await client.refreshOAuth2Token(tweeter.refreshToken);


            await this._userRepository.updateTweeterObject(userEmail, {
                refreshToken: refreshToken,
                token: accessToken,
                codeVerifier: null,
                state: null,
                twitterId: tweeterID,
                isActivated: true,
                tweeterRealID: tweeter.tweeterRealID,
                redirectURL: tweeter.redirectURL
            });

            const profileData = await twcl.v2.me({"user.fields": ["name", "id", "profile_image_url", "username"]});
            console.log(profileData);
            try {
                let result;
                if (img) {
                    const mediaID = await twcl.v1.uploadMedia(__dirname + "/../../../../public/" + img);
                    console.log(mediaID);
                    result = await twcl.v2.tweet({
                        text: content,
                        media: {
                            media_ids: [mediaID]
                        }
                    });
                } else {
                    await twcl.v2.tweet(content)
                }

            } catch (e) {
                console.dir(e);
                return new BaseAppResult(false, true, '', ResultStatus.Duplicate);
            }


            return new BaseAppResult<boolean>(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            let user = await this._userRepository.findByEmail(userEmail);
            await this._userRepository.deleteTweeter(user.data.email, tweeterID);

            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    async getUserTweets(userID: string): Promise<BaseAppResult<Tweet[] | boolean>> {
        try {
            let result = await this._tweetRepository.getAllUserTweets(userID);
            if (result.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Server",
                    ResultStatus.Unknown
                );
            }

            return new BaseAppResult<Tweet[] | boolean>(
                result.data,
                false,
                '',
                ResultStatus.Success
            )
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);

            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            );
        }
    }

    async scheduleTweet(userEmail: string, tweeterID: string, content: string, time: Date, img?: string): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let tweeter = user.data.twitters.find(t => t.twitterId == tweeterID);
            if (!tweeter) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweeter not found",
                    ResultStatus.NotFound
                );
            }
            let result = await this._tweetRepository.create(new Tweet(
                this._idService.generate(),
                user.data._id,
                time,
                content,
                new Date(),
                false,
                tweeterID,
                false,
                null,
                img
            ));

            return new BaseAppResult<boolean>(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    async getTweeterProfiles(userEmail: string): Promise<BaseAppResult<any[]>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<any[]>(
                    [],
                    false,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let tweeters = user.data.twitters;
            let result = [];
            for (const tweeter of tweeters) {
                if (!tweeter.tweeterRealID) continue;
                try {


                    let cache = getUserFromRealID(tweeter.tweeterRealID);
                    let data;
                    if (cache) {
                        data = {
                            name: cache.name,
                            username: cache.username,
                            profile_image_url: cache.profile_image_url,
                            tweeterID: tweeter.twitterId,
                            tweeterRealID: tweeter.tweeterRealID
                        };
                    } else {
                        const {
                            refreshToken,
                            accessToken,
                            client: twcl
                        } = await client.refreshOAuth2Token(tweeter.refreshToken);
                        await this._userRepository.updateTweeterObject(userEmail, {
                            refreshToken: refreshToken,
                            token: accessToken,
                            codeVerifier: null,
                            state: null,
                            twitterId: tweeter.twitterId,
                            isActivated: true,
                            tweeterRealID: tweeter.tweeterRealID,
                            redirectURL: tweeter.redirectURL
                        });


                        const profileData = await twcl.v2.me({"user.fields": ["name", "id", "profile_image_url", "username"]});
                        data = {
                            name: profileData.data.name,
                            username: profileData.data.username,
                            profile_image_url: profileData.data.profile_image_url,
                            tweeterID: tweeter.twitterId,
                            tweeterRealID: tweeter.tweeterRealID
                        };
                        cacheTweeterUser(data);
                    }
                    result.push(data);
                } catch (e) {
                    console.log(e);
                }

            }
            return new BaseAppResult<any[]>(
                result,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    static isStartInterval = false;

    startInterval(onInvalidUser = (userID: string, tweetID: string) => {
        console.log(userID);
        console.log(tweetID);
    }) {
        if (!Twitter.isStartInterval) {
            Twitter.isStartInterval = true;
            setInterval(async () => {
                console.log('start interval!.');
                let tweets = await this._tweetRepository.getUnSendTweets(new Date());
                console.log(tweets);
                if (tweets.data.length != 0) {
                    for (const tweet of tweets.data) {
                        console.log('sent');
                        let user = await this._userRepository.findById(tweet.senderID);
                        if (user.isError) {
                            await this._tweetRepository.sent(tweet._id);
                            continue;
                        }
                        let result;
                        if (tweet.isThread) {
                            result = await this.thread(user.data._id, tweet.posts, tweet.tweeterID);
                        } else {
                            result = await this.tweet(user.data.email, tweet.tweeterID, tweet.content);
                        }
                        if (result.isError) {
                            onInvalidUser(user.data._id, tweet._id);
                        }
                        await this._tweetRepository.sent(tweet._id);
                    }
                }
            }, +process.env.INTERVAL * 1000);
        }

    }

    async deleteTweet(userEmail: string, tweetID: string): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let tweet = await this._tweetRepository.getTweetById(tweetID);
            if (tweet.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweet not found",
                    ResultStatus.NotFound
                );
            }
            if (tweet.data.senderID != user.data._id) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweet not found",
                    ResultStatus.NotFound
                );
            }
            await this._tweetRepository.delete(tweetID);

            return new BaseAppResult<boolean>(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    async editTweet(userEmail: string, tweetID: string, content: string, time: Date): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findByEmail(userEmail);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }
            let tweet = await this._tweetRepository.getTweetById(tweetID);
            if (tweet.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweet not found",
                    ResultStatus.NotFound
                );
            }
            if (tweet.data.senderID != user.data._id) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweet not found",
                    ResultStatus.NotFound
                );
            }
            await this._tweetRepository.edit(new Tweet(
                tweetID,
                user.data._id,
                time,
                content,
                new Date(),
                false,
                tweet.data.tweeterID
            ));

            return new BaseAppResult<boolean>(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }


    async deleteTweeter(userID: string, id: string) {
        try {
            let result = await this._userRepository.deleteTweeter(userID, id);
            if (result.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    '',
                    ResultStatus.NotFound
                );

            }
            return new BaseAppResult(true, false, '', ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    async thread(userID: string, parts: string[], tweeterID: string, img?: string) {
        try {

            let user = await this._userRepository.findById(userID);
            if (user.isError) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "User not found",
                    ResultStatus.NotFound
                );
            }

            let tweeter = user.data.twitters.find(t => t.twitterId == tweeterID);

            if (!tweeter) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweeter not found",
                    ResultStatus.NotFound
                );
            }

            const {
                refreshToken,
                accessToken,
                client: twcl
            } = await client.refreshOAuth2Token(tweeter.refreshToken);

            await this._userRepository.updateTweeterObject(user.data.email, {
                refreshToken: refreshToken,
                token: accessToken,
                codeVerifier: null,
                state: null,
                twitterId: tweeterID,
                isActivated: true,
                tweeterRealID: tweeter.tweeterRealID,
                redirectURL: tweeter.redirectURL
            });

            try {
                await twcl.v2.tweetThread(parts);
            } catch (e) {
                console.log(e);
                return new BaseAppResult(false, true, '', ResultStatus.Duplicate);
            }
            return new BaseAppResult(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            await this._userRepository.deleteTweeter(userID, tweeterID);
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

    async scheduleTeared(userID: string, parts: string[], tweeterID: string, dateToRelease, img?: string) {
        try {
            let user = await this._userRepository.findById(userID);
            if (user.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    '',
                    ResultStatus.NotFound
                );
            }
            let tweeter = user.data.twitters.find(t => t.twitterId == tweeterID);
            if (!tweeter) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Tweeter not found",
                    ResultStatus.NotFound
                );
            }
            let id = this._idService.generate();
            let result = await this._tweetRepository.create(new Tweet(
                id,
                user.data._id,
                dateToRelease,
                parts.join('\n'),
                new Date(),
                false,
                tweeterID,
                true,
                parts
            ));

            if (result.isError) {
                this._loggerService.error("error on adding tweet.");
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    "Server",
                    ResultStatus.Unknown
                );
            }

            return new BaseAppResult(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<boolean>(
                false,
                true,
                "Server",
                ResultStatus.Unknown
            )
        }
    }

}