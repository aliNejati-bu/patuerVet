import {Schema, model} from "mongoose";
import {Report} from "../../Entities/Report";

const reportSchema = new Schema<Report>({
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
    userID: {
        type: String,
        required: true
    },
    typeOf: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    contents: {
        type: [String],
        default: []
    },
    isProgress: {
        type: Boolean,
        default: true
    },
    profile: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        default: ''
    }
});

export default model<Report>("Report", reportSchema);