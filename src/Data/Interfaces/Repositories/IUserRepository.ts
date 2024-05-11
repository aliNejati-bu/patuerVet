import {User} from "../../Entities/User";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";

export interface IUserRepository {

    addEmailCode(userEmail: string, obj: {
        code: string,
        expireAt: Date
    }): Promise<BaseDataResult<boolean>>;

    addTwitter(userEmail: string, obj: {
                   refreshToken: string | null,
                   token: string | null,
                   codeVerifier: null | string,
                   state: null | string,
                   twitterId: string | null,
                   isActivated: boolean,
                   tweeterRealID: string | null,
                   redirectURL: string | null
               }
    ): Promise<BaseDataResult<boolean>>;

    addLinkedin(userEmail: string, obj: {
        refreshToken: string | null,
        token: string | null,
        codeVerifier: null | string,
        linkedinId: null | string,
        isActivated: boolean,
        redirectURL: string | null,
        expireAt: number | null
    }): Promise<BaseDataResult<boolean>>;


    updateLinkedinObject(userEmail: string, obj: {
        refreshToken: string | null,
        token: string | null,
        codeVerifier: null | string,
        linkedinId: null | string,
        isActivated: boolean,
        redirectURL: string | null,
        expireAt: number | null
    }): Promise<BaseDataResult<boolean>>

    findUserByUserByLinkedinId(linkedinID: string): Promise<BaseDataResult<User>>;

    changeVerificationStatus(userID: string, status: boolean): Promise<BaseDataResult<boolean>>;


    create(user: User): Promise<BaseDataResult<User>>;

    deleteTweeter(userID: string, id: string): Promise<BaseDataResult<boolean>>;


    deleteTwitter(userEmail: string, twitterId: string): Promise<BaseDataResult<boolean>>;

    findByEmail(email: string): Promise<BaseDataResult<User>>;

    findById(id: string): Promise<BaseDataResult<User>>;

    findUserByTweeterId(twitterId: string): Promise<BaseDataResult<User>>;

    findUserByTweeterRealID(twitterRealID: string): Promise<BaseDataResult<User>>;


    findUserByTweeterState(state: string): Promise<BaseDataResult<User>>;


    updateTweeterObject(userEmail: string, obj: {
                            refreshToken: string | null,
                            token: string | null,
                            codeVerifier: null | string,
                            state: null | string,
                            twitterId: string,
                            isActivated: boolean,
                            tweeterRealID: string | null,
                            redirectURL: string | null
                        }
    ): Promise<BaseDataResult<boolean>>;

    updateUserEntityByID(userID: string, user: User): Promise<BaseDataResult<boolean>>;

    updateUserStatusAndTime(userID: string, endDate: number, status: 1 | 2 | 3): Promise<BaseDataResult<boolean>>;

    addPaymentHistory(userID: string, historyObject: {
                          date: Date,
                          amount: number,
                          type: number,
                          numericName: number
                      }
    ): Promise<BaseDataResult<boolean>>;

    showPayments(
        userID: string
    ): Promise<BaseDataResult<{
        date: Date,
        amount: number,
        type: number,
        numericName: number
    }[]>>

}