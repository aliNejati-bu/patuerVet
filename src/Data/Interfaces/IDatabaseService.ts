import {IUserRepository} from "./Repositories/IUserRepository";
import {ITweetRepository} from "./Repositories/ITweetRepository";

export interface IDatabaseService {
    connect(): Promise<void>;

    userRepository: IUserRepository;

    tweetRepository: ITweetRepository;
}