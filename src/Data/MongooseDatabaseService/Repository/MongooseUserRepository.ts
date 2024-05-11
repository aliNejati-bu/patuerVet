import {IUserRepository} from "../../Interfaces/Repositories/IUserRepository";
import {User} from "../../Entities/User";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import MongooseUserModel from "../Model/MongooseUserModel";
import {id, inject, injectable} from "inversify";
import {BaseDataError} from "../../Errors/BaseDataError";
import {date} from "joi";


@injectable()
export class MongooseUserRepository implements IUserRepository {


}
