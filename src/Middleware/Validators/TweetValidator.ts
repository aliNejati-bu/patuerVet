import * as joi from 'joi';
import {BaseValidator} from "./BaseValidator";
import {BaseValidatorAppResult} from "../../App/Model/Result/Validator/BaseValidatorAppResult";
import {injectable} from "inversify";


@injectable()
export class TweetValidator extends BaseValidator {
    createTweet<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            tweet: joi.string().required(),
            tweeterID: joi.string().required().max(255),
            img: joi.string()
        });
        return this.createResult<T>(schema, input);
    }

    schedulingTweet<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            tweet: joi.string().required(),
            date: joi.date().required(),
            tweeterID: joi.string().required().max(255),
            img: joi.string()
        });
        return this.createResult<T>(schema, input);
    }

    editTweet<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            tweet: joi.string().required(),
            time: joi.date().required()
        });
        return this.createResult<T>(schema, input);
    }

    generateLink<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            redirectURL: joi.string().required().max(255),
        });
        return this.createResult<T>(schema, input);
    }

    createThread<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            parts: joi.array().items(joi.string()).required(),
            tid: joi.string().required(),
            img: joi.string()
        });
        return this.createResult<T>(schema, input);
    }

    schedulingThread<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            parts: joi.array().items(joi.string()).required(),
            tid: joi.string().required(),
            date: joi.date().required(),
            img: joi.string()
        });
        return this.createResult<T>(schema, input);
    }
}