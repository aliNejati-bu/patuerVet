import {injectable} from "inversify";
import {BaseValidator} from "./BaseValidator";
import {BaseValidatorAppResult} from "../../App/Model/Result/Validator/BaseValidatorAppResult";
import * as joi from "joi";

@injectable()
export class LinkedinValidator extends BaseValidator {
    createPost<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            content: joi.string().required(),
            linkedinID: joi.string().required()
        });
        return this.createResult<T>(schema, input);
    }
}