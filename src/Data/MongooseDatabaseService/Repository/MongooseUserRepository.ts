import {IUserRepository} from "../../Interfaces/Repositories/IUserRepository";
import {User} from "../../Entities/User";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import MongooseUserModel from "../Model/MongooseUserModel";
import {id, inject, injectable} from "inversify";
import {BaseDataError} from "../../Errors/BaseDataError";
import {MongooseTweetRepository} from "./MongooseTweetRepository";
import MongooseTweetModel from "../Model/MongooseTweetModel";
import {date} from "joi";


@injectable()
export class MongooseUserRepository implements IUserRepository {
    async showPayments(userID: string): Promise<BaseDataResult<{
        date: Date,
        amount: number,
        type: number,
        numericName: number
    }[]>> {
        try {
            let result = await this.findById(userID);
            if (result.isError) {
                return new BaseDataResult([], true);
            }

            return new BaseDataResult(
                result.data.paymentsHistory,
                false
            );

        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async updateUserStatusAndTime(userID: string, endDate: number, status: 1 | 2 | 3): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                _id: userID
            }, {
                $set: {
                    userType: status,
                    toDate: endDate,
                    periodStartAt: Date.now()
                }
            });

            return new BaseDataResult(
                result.matchedCount > 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async addPaymentHistory(userID: string, historyObject: {
        date: Date;
        amount: number;
        type: number;
        numericName: number;
    }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                _id: userID
            }, {
                $push: {
                    paymentsHistory: historyObject
                }
            });
            return new BaseDataResult(
                result.matchedCount > 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }


    async updateUserEntityByID(userID: string, user: User): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                _id: userID
            }, {
                $set: {
                    password: user.password,
                    name: user.name,
                    lastName: user.lastName
                }
            });

            return new BaseDataResult<boolean>(
                result.matchedCount != 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }


    async create(user: User): Promise<BaseDataResult<User>> {
        try {
            const mongooseUser = new MongooseUserModel(user);
            const result = await mongooseUser.save();
            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async findByEmail(email: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                email
            });

            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while finding user", e);
        }
    }

    async findById(id: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                _id: id
            });

            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while finding user", e);
        }
    }


    async addEmailCode(userEmail: string, obj: { code: string; expireAt: Date; }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({email: userEmail},
                {
                    $set: {
                        verification: obj
                    }
                });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async changeVerificationStatus(userID: string, status: boolean): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({_id: userID}, {
                $set: {
                    isVerified: status
                }
            });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async addTwitter(userEmail: string, obj: {
        refreshToken: string | null;
        token: string | null;
        codeVerifier: string | null;
        state: string | null;
        twitterId: string | null;
        isActivated: boolean,
        tweeterRealID: string | null,
        redirectURL: string | null
    }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({email: userEmail}, {
                $push: {
                    twitters: obj
                }
            });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async deleteTwitter(userEmail: string, twitterId: string): Promise<BaseDataResult<boolean>> {
        try {
            console.log(twitterId);
            let result = await MongooseUserModel.updateOne({email: userEmail}, {
                $pull: {
                    twitters: {
                        twitterId
                    }
                }
            });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);

        }
    }

    async findUserByTweeterId(twitterId: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                "twitters.twitterId": twitterId
            });

            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async findUserByTweeterState(state: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                "twitters.state": state
            });

            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async updateTweeterObject(userEmail: string, obj: {
        refreshToken: string | null,
        token: string | null,
        codeVerifier: string | null,
        state: string | null,
        twitterId: string,
        isActivated: boolean,
        tweeterRealID: string | null,
        redirectURL: string | null
    }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                "twitters.twitterId": obj.twitterId
            }, {
                $set: {
                    "twitters.$": obj
                }
            });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async findUserByTweeterRealID(twitterRealID: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                "twitters.tweeterRealID": twitterRealID
            });

            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async deleteTweeter(userID: string, id: string): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.findOne({
                _id: userID
            });
            if (!result) {
                return new BaseDataResult<boolean>(false, true);
            }
            let tweeters = result.twitters;
            tweeters = tweeters.filter(x => x.twitterId != id);

            await MongooseUserModel.updateOne({
                _id: userID
            }, {
                $set: {
                    twitters: tweeters
                }
            });

            await MongooseTweetModel.deleteMany({
                tweeterID: id
            });

            return new BaseDataResult(true, false);
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async addLinkedin(userEmail: string, obj: {
        refreshToken: string | null,
        token: string | null,
        codeVerifier: null | string,
        linkedinId: null | string,
        isActivated: boolean,
        redirectURL: string | null,
        expireAt: number | null
    }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                    email: userEmail
                },
                {
                    $push: {
                        linkedins: obj
                    }
                });

            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async findUserByUserByLinkedinId(linkedinID: string): Promise<BaseDataResult<User>> {
        try {
            const result = await MongooseUserModel.findOne({
                "linkedins.linkedinId": linkedinID
            });
            if (!result) {
                return new BaseDataResult(null, true);
            }

            return new BaseDataResult<User>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while finding user", e);
        }
    }

    async updateLinkedinObject(userEmail: string, obj: {
        refreshToken: string | null,
        token: string | null,
        codeVerifier: null | string,
        linkedinId: null | string,
        isActivated: boolean,
        redirectURL: string | null,
        expireAt: number | null
    }): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                "linkedins.linkedinId": obj.linkedinId
            }, {
                $set: {
                    "linkedins.$": obj
                }
            });
            return new BaseDataResult<boolean>(result.matchedCount != 0, result.matchedCount == 0)
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }


}
