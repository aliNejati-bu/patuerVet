import {ITweetRepository} from "../../Interfaces/Repositories/ITweetRepository";
import {injectable} from "inversify";
import {Tweet} from "../../Entities/Tweet";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import MongooseTweetModel from "../Model/MongooseTweetModel";
import {BaseDataError} from "../../Errors/BaseDataError";



@injectable()
export class MongooseTweetRepository implements ITweetRepository {
    async create(tweet: Tweet): Promise<BaseDataResult<boolean>> {
        try {
            const mongooseUser = new MongooseTweetModel(tweet);
            const result = await mongooseUser.save();
            return new BaseDataResult<boolean>(
                true,
                false
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async getAllUserTweets(userId: string): Promise<BaseDataResult<Tweet[]>> {
        try {
            let result = await MongooseTweetModel.find({
                senderID: userId
            });

            result.map(e => e.toObject());
            return new BaseDataResult<Tweet[]>(
                result,
                false
            )
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async getUnSendTweets(now: Date): Promise<BaseDataResult<Tweet[]>> {
        try {
            let result = await MongooseTweetModel.find({
                sendStatus: false,
                time: {
                    $lte: Date.now()
                }
            });

            result.map(e => e.toObject());
            return new BaseDataResult<Tweet[]>(
                result,
                false
            )
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async sent(tweetId): Promise<BaseDataResult<any>> {
        try {
            let result = await MongooseTweetModel.updateOne({
                _id: tweetId
            }, {
                $set: {
                    sendStatus: true
                }
            });

            return new BaseDataResult<any>(
                result.matchedCount != 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async delete(tweetId: string): Promise<BaseDataResult<any>> {
        try {
            let result = await MongooseTweetModel.deleteOne({
                _id: tweetId
            });

            return new BaseDataResult<any>(
                result.deletedCount != 0,
                result.deletedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async edit(tweet: Tweet): Promise<BaseDataResult<any>> {
        try {
            let result = await MongooseTweetModel.updateOne({
                _id: tweet._id
            }, {
                $set: {
                    time: tweet.time,
                    content: tweet.content,
                    tweeterID: tweet.tweeterID
                }
            });

            return new BaseDataResult<any>(
                result.matchedCount != 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }


    async getTweetById(tweetId: string): Promise<BaseDataResult<Tweet>> {
        try {
            let result = await MongooseTweetModel.findOne({
                _id: tweetId
            });

            if (!result) {
                return new BaseDataResult<Tweet>(
                    null,
                    true
                );
            }

            return new BaseDataResult<Tweet>(
                result.toObject(),
                false
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

}