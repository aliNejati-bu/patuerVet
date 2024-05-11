export type Message = {
    sender: string
    senderType: number,
    message: string,
    date: string

}

export class Ticket {
    constructor(
        public _id: string,
        public userID: string,
        public messages: Message[],
        public createdAt: Date,
        public priority: boolean,
        public status: number,
        
    ) {
    }
}