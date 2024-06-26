import {Controller} from "../../index";
import {UserValidator} from "../../../Middleware/Validators/UserValidator";
import {Auth} from "../../../App/Logic/Auth";
import {container} from "../../../Container";
import {NextFunction, Request, Response} from "express";
import {baseResponse, serverErrorResponse} from "../../../helpers/functions";
import {ResultStatus} from "../../../App/Model/Result/ResultStatus";
import {wrapValidatorToMiddleware} from "../../../Middleware/general";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";


class AuthController extends Controller {

    constructor(
        private _auth: Auth,
        public _userValidator: UserValidator
    ) {
        super("/auth");
    }

    async login(req: Request, res: Response, next: NextFunction) {
        let result = await this._auth.generateTokenByMobileAndPassword(req.body.mobile, req.body.password);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, ResultStatus.Unknown);
            } else {
                return baseResponse(res, {}, 'Email and Password Not Match.', undefined, result.ResultStatus, 403);
            }
        }
        return baseResponse(res, result.result);
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        const result = await this._auth.getUserDataByMobile(req.body.user.mobile);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }
        (result.result as any).profile = '/profile.webp';
        return baseResponse(res, result.result)
    }

    async sendCode(req: Request, res: Response, next: NextFunction) {
        let result = await this._auth.sendCode(req.body.mobile);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, result.ResultStatus);
            }
            return baseResponse(res, {}, 'error.', undefined, result.ResultStatus, 403);
        }
        return baseResponse(res, {});
    }

    async verifyCode(req: Request, res: Response, next: NextFunction) {
        let result = await this._auth.verifyCode(req.body.mobile, req.body.code, req.body.password);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, result.ResultStatus);
            }
            return baseResponse(res, {}, 'error.', undefined, result.ResultStatus, 419);
        }
        return baseResponse(res, {});
    }

}

export default function (): AuthController {
    const controller = new AuthController(
        container.get(Auth),
        container.get(UserValidator)
    );

    controller.addAction('/login', "post", controller.login, [
        wrapValidatorToMiddleware(controller._userValidator.getToken)
    ]);

    controller.addAction('/me', "get", controller.getMe, [
        verifyClientToken
    ]);

    controller.addAction('/sendCode', 'post', controller.sendCode, [
        wrapValidatorToMiddleware(controller._userValidator.sendCode)
    ]);

    controller.addAction('/verifyCode', "post", controller.verifyCode, [
        wrapValidatorToMiddleware(controller._userValidator.verifyCode)
    ])
    return controller;
}