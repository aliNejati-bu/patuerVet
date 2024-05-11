export class User {
    constructor(
        public _id: string,
        public name: string,
        public lastName: string,
        public email: string,
        public password: string,
        public createdAt: Date,
        public updatedAt: Date,
        public twitters: {
            refreshToken: string | null,
            token: string | null,
            codeVerifier: null | string,
            state: null | string,
            twitterId: string | null
            isActivated: boolean,
            tweeterRealID: string | null,
            redirectURL: string | null,
        }[] = [],
        public verification: {
            code: string | null,
            expireAt: Date | null
        } = {
            code: null,
            expireAt: null
        },
        public isVerified: boolean = false,
        public userType: 1 | 2 | 3 = 1,
        public toDate: number = null,
        public paymentsHistory: Array<{
            date: Date,
            amount: number,
            type: number,
            numericName: number
        }> = [],
        public periodStartAt: number = null,
        public linkedins: {
            refreshToken: string | null,
            token: string | null,
            codeVerifier: null | string,
            linkedinId: null | string,
            isActivated: boolean,
            redirectURL: string | null,
            expireAt: number | null
        }[] = []
    ) {
    }
}