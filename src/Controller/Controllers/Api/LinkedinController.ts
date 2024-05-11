import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import {Linkedin} from "../../../App/Logic/Linkedin";
import {container} from "../../../Container";
import {baseResponse, serverErrorResponse} from "../../../helpers/functions";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";
import {LinkedinValidator} from "../../../Middleware/Validators/LinkedinValidator";
import {wrapValidatorToMiddleware} from "../../../Middleware/general";


class LinkedinController extends Controller {

    constructor(
        private _linkedin: Linkedin,
        public linkedinValidator: LinkedinValidator
    ) {
        super("/linkedin");
    }


    async generateLink(req: Request, res: Response, next: NextFunction) {
        let result = await this._linkedin.generateAuthLink(req.body.user.email);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus)
        }

        return baseResponse(res, {
            url: result.result
        });
    }

    async verifyToken(req: Request, res: Response, next: NextFunction) {
        let result = await this._linkedin.verifyLinkedin(req.query.code as string, req.query.state as string);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus)
        }

        return baseResponse(res, result.result);
    }

    async instantPost(req: Request, res: Response, next: NextFunction) {
        let result = await this._linkedin.instantPost(req.body.user.email, req.body.content, req.body.linkedinID)
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus)
        }

        return baseResponse(res, result.result);
    }


}

export default function (): LinkedinController {
    const controller = new LinkedinController(
        container.get<Linkedin>(Linkedin),
        container.get<LinkedinValidator>(LinkedinValidator)
    );

    controller.addAction('/generate-link', "get", controller.generateLink, [
        verifyClientToken
    ]);


    controller.addAction('/verify-code', "get", controller.verifyToken, [
        verifyClientToken
    ]);

    controller.addAction('/instant-post', "post", controller.instantPost, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller.linkedinValidator.createPost)
    ]);

    return controller;
}