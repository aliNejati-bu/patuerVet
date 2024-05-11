import {Schema, model} from "mongoose";
import {User} from "../../Entities/User";
import {Tweet} from "../../Entities/Tweet";

const tweetSchema = new Schema<Tweet>({
    _id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    senderID: {
        type: String,
        ref: 'User'
    },
    sendStatus: {
        type: Boolean,
        default: false
    },
    tweeterID: {
        type: String,
        required: true

    },
    isThread: {
        type: Boolean,
        default: false
    },
    posts: {
        type: [String],
        default: []
    },
    media: {
        type: String,
        default: null
    }
});

export default model<Tweet>("Tweet", tweetSchema);