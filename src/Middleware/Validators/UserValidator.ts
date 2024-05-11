import * as joi from 'joi';
import {BaseValidator} from "./BaseValidator";
import {BaseValidatorAppResult} from "../../App/Model/Result/Validator/BaseValidatorAppResult";
import {injectable} from "inversify";


@injectable()
export class UserValidator extends BaseValidator {
    createUser<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            name: joi.string().required().max(255),
            lastName: joi.string().required().max(255),
            email: joi.string().email().required().max(255),
            password: joi.string().required().max(255)
        });
        return this.createResult<T>(schema, input);
    }

    getToken<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            mobile: joi.string().required().max(255),
            password: joi.string().required().max(255)
        });
        return this.createResult<T>(schema, input);
    }


    sendCode<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            mobile: joi.string().required().max(255),
        });
        return this.createResult<T>(schema, input);
    }

    verifyCode<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            mobile: joi.string().required().max(255),
            code: joi.string().required().max(255),
            password: joi.string().required().min(8).max(255),
        });
        return this.createResult<T>(schema, input);
    }


    updateUser<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            firstName: joi.string().required(),
            lastName: joi.string().required()
        });
        return this.createResult<T>(schema, input);
    }

    resetPassword<T>(input): BaseValidatorAppResult<T | null> {
        let schema = joi.object().keys({
            password: joi.string().required()
        });
        return this.createResult<T>(schema, input);
    }
}