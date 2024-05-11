import {Schema, model} from "mongoose";
import {User} from "../../Entities/User";

const userSchema = new Schema<User>({
    _id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    },
    twitters: {
        type: [{
            refreshToken: {
                type: String,
                default: null
            },
            token: {
                type: String,
                default: null
            },
            codeVerifier: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            twitterId: {
                type: String,
                required: true
            },
            isActivated: {
                type: Boolean,
                default: false
            },
            tweeterRealID: {
                type: String,
                default: null
            },
            redirectURL: {
                type: String,
                default: ''
            }
        }],
        default: []
    },
    lastName: {
        type: String,
        required: true
    },
    verification: {
        type: {
            code: {
                type: String,
                default: null
            },
            expireAt: {
                type: Date,
                default: null
            }
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userType: {
        type: Number,
        default: 1
    },
    toDate: {
        type: Number,
        default: null
    },
    paymentsHistory: {
        type: [{
            date: {
                type: Date,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: Number,
                required: true
            },
            numericName: {
                type: Number,
                required: true
            }
        }],
        default: []
    },
    periodStartAt: {
        type: Number,
        default: null
    },
    linkedins: {
        type: [{
            refreshToken: {
                type: String,
                default: null
            },
            token: {
                type: String,
                default: null
            },
            codeVerifier: {
                type: String,
                required: true
            },
            linkedinId: {
                type: String,
                required: true
            },
            isActivated: {
                type: Boolean,
                default: false
            },
            redirectURL: {
                type: String,
                default: ''
            },
            expireAt: {
                type: String,
                default: null
            }
        }],
        default: []
    }
});

export default model<User>("User", userSchema);