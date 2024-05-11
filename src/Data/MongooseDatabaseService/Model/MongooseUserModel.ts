import {Schema, model} from "mongoose";
import {User} from "../../Entities/User";

const userSchema = new Schema<User>({
    IDU: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    wtsapp: {
        type: String,
        unique: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    addrs: {
        type: String,
        required: true
    },
    vet: {
        type: String,
        required: true
    },
    ecocode: {
        type: String,
        required: true
    },
    tozihat: {
        type: String,
        required: true
    },
    faaliat: {
        type: String,
        required: true
    }
});

export default model<User>("Userdb", userSchema);