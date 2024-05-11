import {Schema, model} from "mongoose";
import {Ticket} from "../../Entities/Ticket";



// @ts-ignore
const ticketSchema = new Schema<Ticket>({
    _id: {
        type: String
    },
    userID: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,

    },
    // @ts-ignore
    messages: {
        type:{
            // @ts-ignore
            sender: {
                type: String
            },
            senderType: {
                type: Number
            },
            message: {
                type: String
            },
            date: {
                type: Date
            }
        }
    }
});

export default model<Ticket>("Ticket", ticketSchema);