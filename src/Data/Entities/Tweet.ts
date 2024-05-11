export class Tweet {
    constructor(
        public _id: string,
        public senderID: string,
        public time: Date,
        public content: string,
        public createdAt: Date,
        public sendStatus: boolean,
        public tweeterID: string,
        public isThread: boolean = false,
        public posts: Array<string> = [],
        public media?: string
    ) {
    }
}