import {injectable} from "inversify";
import {BaseValidator} from "./BaseValidator";
import {BaseValidatorAppResult} from "../../App/Model/Result/Validator/BaseValidatorAppResult";
import * as joi from "joi";

@injectable()
export class AiValidator extends BaseValidator {
    tweeterByContent<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            withEmoji: joi.boolean().required(),
            withHashtag: joi.boolean().required(),
            word: joi.number().required(),
            content: joi.string().required(),
            toneOfVoice: joi.string().required(),
            profile: joi.string().required(),
            userName: joi.string().required(),
            tweeterID: joi.string().required(),
            numberOf: joi.number().required()
        });
        return this.createResult<T>(schema, input);
    }

    linkedinByContent<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            withEmoji: joi.boolean().required(),
            withHashtag: joi.boolean().required(),
            word: joi.number().required(),
            content: joi.string().required(),
            toneOfVoice: joi.string().required(),
            profile: joi.string().required(),
            userName: joi.string().required(),
            tweeterID: joi.string().required(),
            numberOf: joi.number().required()
        });
        return this.createResult<T>(schema, input);
    }

    postByUrl<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            url: joi.string().required(),
            withEmoji: joi.boolean().required(),
            withHashtag: joi.boolean().required(),
            word: joi.number().required(),
            toneOfVoice: joi.string().required(),
            profile: joi.string().required(),
            userName: joi.string().required(),
            tweeterID: joi.string().required(),
            numberOf: joi.number().required()
        });
        return this.createResult<T>(schema, input);
    }

    postByContents<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            withEmoji: joi.boolean().required(),
            withHashtag: joi.boolean().required(),
            contents: joi.array().required(),
            toneOfVoice: joi.string().required(),
            profile: joi.string().required(),
            userName: joi.string().required(),
            tweeterID: joi.string().required(),
            numberOf: joi.number().required()
        });
        return this.createResult<T>(schema, input);
    }
}