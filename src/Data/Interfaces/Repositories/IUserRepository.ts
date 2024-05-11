import {User} from "../../Entities/User";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";

export interface IUserRepository {
    findUserByMobile(mobile: string): Promise<BaseDataResult<User | null>>
}