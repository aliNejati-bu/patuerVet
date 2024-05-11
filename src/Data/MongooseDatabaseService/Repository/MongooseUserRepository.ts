import {IUserRepository} from "../../Interfaces/Repositories/IUserRepository";
import {User} from "../../Entities/User";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import MongooseUserModel from "../Model/MongooseUserModel";
import {id, inject, injectable} from "inversify";
import {BaseDataError} from "../../Errors/BaseDataError";


@injectable()
export class MongooseUserRepository implements IUserRepository {
    async updateUserPassword(mobile: string, password: string): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseUserModel.updateOne({
                mobile: mobile
            }, {
                $set: {
                    password: password
                }
            });
            if (result.matchedCount == 0) {
                return new BaseDataResult<boolean>(false, true);
            }
            return new BaseDataResult<boolean>(true, false);
        } catch (e) {
            throw new BaseDataError("Error while updating user", e);
        }
    }

    async findUserByMobile(mobile: string): Promise<BaseDataResult<User | null>> {
        try {
            const user = await MongooseUserModel.findOne({
                mobile: mobile
            });
            if (!user) {
                return new BaseDataResult<User | null>(null, true);
            }
            return new BaseDataResult<User | null>(user.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while finding user", e);
        }
    }


}
