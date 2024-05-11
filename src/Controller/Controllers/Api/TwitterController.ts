import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import TwitterSDK from 'twitter-api-v2'
import {container} from "../../../Container";
import {baseResponse, notFoundedResponse, serverErrorResponse, unAuth} from "../../../helpers/functions";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";
import {Auth} from "../../../App/Logic/Auth";
import {Twitter} from "../../../App/Logic/Twitter";
import {ResultStatus} from "../../../App/Model/Result/ResultStatus";
import {TweetValidator} from "../../../Middleware/Validators/TweetValidator";
import {wrapValidatorToMiddleware} from "../../../Middleware/general";


const client = new TwitterSDK({
    clientId: process.env.TWITTER_CID,
    clientSecret: process.env.TWITTER_SECRET
});


class TwitterController extends Controller {

    constructor(
        private _auth: Auth,
        private _twitter: Twitter,
        public _twitterValidator: TweetValidator
    ) {
        super("/twitter");
    }

    async generateAuthLink(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.generateAuthLink(req.body.user.email, req.body.redirectURL);
        if (result.isError) {
            return serverErrorResponse(res, ResultStatus.Unknown);
        }
        return baseResponse(res, {url: result.result});
    }

    async verify(req: Request, res: Response, next?: NextFunction) {
        const result = await this._twitter.verifyTwitter(req.query.code as string, req.query.state as string);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotMatch) {
                return notFoundedResponse(res);
            } else if (result.ResultStatus == ResultStatus.Invalid) {
                return baseResponse(res, {}, 'To Many', undefined, result.ResultStatus, 429);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }
        return baseResponse(res, {
            msg: 'good'
        });
    }

    async tweet(req: Request, res: Response, next?: NextFunction) {
        const result = await this._twitter.tweet(
            req.body.user.email,
            req.body.tweeterID,
            req.body.tweet,
            req.body.img
        );
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            } else if (result.ResultStatus == ResultStatus.Duplicate) {
                return baseResponse(res, [], "", undefined, ResultStatus.Duplicate, 409);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {});
    }


    async scheduleTweet(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.scheduleTweet(
            req.body.user.email,
            req.body.tweeterID,
            req.body.tweet,
            req.body.date,
            req.body.img
        );
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {});
    }

    async myTweets(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.getUserTweets(req.body.user._id);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return unAuth(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, result.result)
    }

    async getProfiles(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.getTweeterProfiles(req.body.user.email);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return unAuth(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, result.result);
    }

    async deleteTweet(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.deleteTweet(req.body.user.email, req.params.tweetID);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {});
    }

    async editTweet(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.editTweet(req.body.user.email, req.params.tweetID, req.body.tweet, req.body.time);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {});
    }

    async deleteTweeter(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.deleteTweeter(req.body.user._id, req.params.id);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            } else {
                return serverErrorResponse(res, result.ResultStatus);
            }
        }

        return baseResponse(res, {}, '');
    }


    async tweeterTeared(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.thread(
            req.body.user._id,
            req.body.parts,
            req.body.tid,
            req.body.img
        );
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            } else if (result.ResultStatus == ResultStatus.Duplicate) {
                return baseResponse(res, [], "", undefined, ResultStatus.Duplicate, 409);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {}, '');
    }

    async scheduleThread(req: Request, res: Response, next?: NextFunction) {
        let result = await this._twitter.scheduleTeared(
            req.body.user._id,
            req.body.parts,
            req.body.tid,
            req.body.date,
            req.body.img
        );
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            }
            return serverErrorResponse(res, ResultStatus.Unknown);
        }

        return baseResponse(res, {});
    }


}

export default function (): TwitterController {
    container.get<Twitter>(Twitter).startInterval();
    const controller = new TwitterController(
        container.get<Auth>(Auth),
        container.get<Twitter>(Twitter),
        container.get<TweetValidator>(TweetValidator)
    );
    controller.addAction('/auth-link', "post", controller.generateAuthLink, [
        wrapValidatorToMiddleware(controller._twitterValidator.generateLink),
        verifyClientToken
    ]);

    controller.addAction('/verify', 'get', (req, res, next) => {
        res.send(req.query);
    })

    controller.addAction('/verify-token', 'get', controller.verify);

    controller.addAction('/tweet', 'post', controller.tweet, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._twitterValidator.createTweet)
    ]);


    controller.addAction('/schedule-tweet', 'post', controller.scheduleTweet, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._twitterValidator.schedulingTweet)
    ]);


    controller.addAction('/tweet', 'get', controller.myTweets, [
        verifyClientToken
    ]);

    controller.addAction('/profiles', 'get', controller.getProfiles, [
        verifyClientToken
    ]);

    controller.addAction('/tweet/:tweetID', 'delete', controller.deleteTweet, [
        verifyClientToken
    ]);

    controller.addAction('/tweet/:tweetID', 'put', controller.editTweet, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._twitterValidator.editTweet)
    ]);

    controller.addAction('/tweeters/:id', 'delete', controller.deleteTweeter, [
        verifyClientToken
    ]);

    controller.addAction('/thread', 'post', controller.tweeterTeared, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._twitterValidator.createThread)
    ]);

    controller.addAction('/schedule-thread', 'post', controller.scheduleThread, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._twitterValidator.schedulingThread)
    ]);

    return controller;
}