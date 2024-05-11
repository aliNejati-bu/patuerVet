import {BaseValidator} from "./Validators/BaseValidator";
import {container} from "../Container";
import {BaseValidatorAppResult} from "../App/Model/Result/Validator/BaseValidatorAppResult";
import {baseResponse} from "../helpers/functions";
import {Request, Response, NextFunction} from "express";
import {Ai} from "../App/Logic/Ai";
import {ResultStatus} from "../App/Model/Result/ResultStatus";

export function wrapValidatorToMiddleware(validator: Function): any {
    return (req, res, next) => {
        validator = validator.bind((container.get(BaseValidator) as BaseValidator));
        let validatorResult = validator(req.body) as BaseValidatorAppResult<any>;
        if (validatorResult.isError) {
            baseResponse(res, {messages: validatorResult.messages}, "validation filed.", null, "error", 400);
        }
        next();
    };
}


export const addContentToBody = async (req: Request, res: Response, next: NextFunction) => {
    const _ai = container.get<Ai>(Ai);
    const result = await _ai.getContentFromUrl(req.body.url);
    if (result.isError) {
        return baseResponse(res, {messages: result.message}, "validation filed.", null, "error", 400);
    }

    /*if (result.result.length > 2000) {
        return baseResponse(res, {messages: "content is too long(max 2000 character)"}, "validation filed.", null, ResultStatus.Invalid, 400);
    }*/

    req.body.content = result.result.substring(0, 5000);

    next();
}