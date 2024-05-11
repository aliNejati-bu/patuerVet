export type TypeOfReport =
    'generateTweet'
    | 'generateThead'
    | 'generateLinkedin'
    | 'scrap'
    | 'scheduleTweet'
    | 'scheduleThead'
    | 'scheduleLinkedin'
    | 'login'
    | 'instantTweet'
    | 'instantThead'
    | 'instantLinkedin';

export class Report {
    constructor(
        public _id: string,
        public typeOf: TypeOfReport,
        public ip: string,
        public userID: string,
        public createdAt: Date,
        public isDelete: boolean = false,
        public contents: string[] = [],
        public isProgress: boolean = true,
        public profile: string = '',
        public userName: string = '',
        public tweeterID: string = ''
    ) {
    }
}