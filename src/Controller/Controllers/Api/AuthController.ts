import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import {wrapValidatorToMiddleware} from "../../../Middleware/general";
import {UserValidator} from "../../../Middleware/Validators/UserValidator";
import {Auth} from "../../../App/Logic/Auth";
import {container} from "../../../Container";
import {ResultStatus} from "../../../App/Model/Result/ResultStatus";
import {baseResponse, duplicateError, notFoundedResponse, serverErrorResponse} from "../../../helpers/functions";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";


class AuthController extends Controller {

    constructor(
        private _auth: Auth,
        public _userValidator: UserValidator
    ) {
        super("/auth");
    }

    async registerUser(req: Request, res: Response, next?: NextFunction) {
        try {
            const result = await this._auth.createUser(req.body.name, req.body.lastName, req.body.email, req.body.password);
            if (result.isError) {
                if (result.ResultStatus == ResultStatus.Unknown) {
                    return serverErrorResponse(res, ResultStatus.Unknown);
                } else {
                    return duplicateError(res);
                }
            }

            return baseResponse(res, {
                _id: result.result.id,
                token: result.result.token
            }, 'User Created.');
        } catch (e) {

        }
    }


    async resetPassword(req: Request, res: Response, next?: NextFunction) {
        const result = await this._auth.updatePassword(req.body.user._id, req.body.password);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            } else {
                return serverErrorResponse(res, result.ResultStatus);
            }
        }
        return baseResponse(res, {}, 'user updated.');
    }

    async loginUser(req: Request, res: Response, next?: NextFunction) {
        const result = await this._auth.getTokenByEmailAndPassword(req.body.email, req.body.password)
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, ResultStatus.Unknown);
            } else {
                return baseResponse(res, {}, 'Email and Password Not Match.', undefined, result.ResultStatus, 403);
            }
        }
        return baseResponse(res, result.result);
    }

    async me(req: Request, res: Response, next?: NextFunction) {
        const result = await this._auth.getUserDataByEmail(req.body.user.email);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }
        (result.result as any).profile = '/profile.webp';
        return baseResponse(res, result.result)
    }

    async regenerateCode(req: Request, res: Response, next?: NextFunction) {
        const result = await this._auth.generateVerifyEmail(req.body.user.email);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }
        return baseResponse(res, {});
    }


    async verifyCode(req: Request, res: Response, next?: NextFunction) {
        let result = await this._auth.verifyCode(req.body.user._id, req.body.code);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Invalid) {
                return baseResponse(res, {}, 'invalid code', undefined, ResultStatus.Invalid, 400);
            } else {
                return serverErrorResponse(res, result.ResultStatus);
            }
        }
        return baseResponse(res, {});
    }


    async updateProfile(req: Request, res: Response, next?: NextFunction) {
        let result = await this._auth.updateProfile(req.body.user._id, req.body.firstName, req.body.lastName);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.NotFound) {
                return notFoundedResponse(res);
            } else {
                return serverErrorResponse(res, result.ResultStatus);
            }
        }
        return baseResponse(res, {}, 'user updated.');
    }


    async generateGoogleLink(req: Request, res: Response, next?: NextFunction) {
        let result = await this._auth.getGoogleAuthLin();
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(
            res,
            result.result,
        );
    }

    async verifyGoogle(req: Request, res: Response, next?: NextFunction) {
        let result = await this._auth.verifyGoogle(req.query.code as string);
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        console.log(result.result)
        return baseResponse(
            res,
            result.result,
        );
    }

}

export default function (): AuthController {
    const controller = new AuthController(
        container.get(Auth),
        container.get(UserValidator)
    );

    controller.addAction('/register', 'post', controller.registerUser, [
        wrapValidatorToMiddleware(controller._userValidator.createUser)
    ]);

    controller.addAction('/login', 'post', controller.loginUser, [
        wrapValidatorToMiddleware(controller._userValidator.getToken)
    ]);


    controller.addAction('/me', "get", controller.me, [
        verifyClientToken
    ]);


    controller.addAction('/me', "post", controller.updateProfile, [
        wrapValidatorToMiddleware(controller._userValidator.updateUser),
        verifyClientToken
    ]);

    controller.addAction('/generate', "get", controller.regenerateCode, [
        verifyClientToken
    ]);

    controller.addAction('/verify_token', "post", controller.verifyCode, [
        wrapValidatorToMiddleware(controller._userValidator.verifyCode),
        verifyClientToken
    ]);

    controller.addAction('/password', 'post', controller.resetPassword, [
        wrapValidatorToMiddleware(controller._userValidator.resetPassword),
        verifyClientToken
    ]);


    controller.addAction('/google-link', 'get', controller.generateGoogleLink);

    controller.addAction('/google-verify', 'get', controller.verifyGoogle)

    return controller;
}