import {Tweet} from "../../Entities/Tweet";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";

export interface ITweetRepository {
    create(tweet: Tweet): Promise<BaseDataResult<boolean>>;

    delete(tweetId: string): Promise<BaseDataResult<any>>;

    edit(tweet: Tweet): Promise<BaseDataResult<any>>;

    getAllUserTweets(userId: string): Promise<BaseDataResult<Tweet[]>>;

    getTweetById(tweetId: string): Promise<BaseDataResult<Tweet>>;

    getUnSendTweets(now: Date): Promise<BaseDataResult<Tweet[]>>;

    sent(tweetId: string): Promise<BaseDataResult<any>>;
}