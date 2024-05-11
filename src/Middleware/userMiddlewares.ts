import {NextFunction, Request, Response} from "express";
import {container} from "../Container";
import {Auth} from "../App/Logic/Auth";
import {baseResponse} from "../helpers/functions";
import {ResultStatus} from "../App/Model/Result/ResultStatus";

let _auth = container.get<Auth>(Auth);

export async function verifyClientToken(req: Request, res: Response, next: NextFunction) {
    // get token from header
    let token = req.headers['Authorization'];
    if (!token) {
        token = req.headers['authorization'];
    }

    // check if token exists
    if (!token) {
        return baseResponse(res, null, "Token is not provided", undefined, ResultStatus.NotAuthorized, 401);
    }

    token = (token as string).replace('Bearer ', '')

    let result = await _auth.verifyAdminToken(token);

    if (result.isError) {
        return baseResponse(res, null, "Token is not valid", undefined, result.ResultStatus, 401);
    }

    // attach user to request
    req.body.user = result.result;

    next();
}

export async function onlyVerifiedUser(req: Request, res: Response, next: NextFunction) {
    let user = await _auth.getUserDataById(req.body.user._id);
    if (!user) {
        return baseResponse(res, null, "User not found", undefined, ResultStatus.NotFound, 404);
    }

    if (!user.result.isVerified) {
        return baseResponse(res, null, "User is not verified", undefined, ResultStatus.NotVerified, 401);
    }

    next();
}