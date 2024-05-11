import {ResultStatus} from "../App/Model/Result/ResultStatus";
import {Response} from "express";
import {IUserRepository} from "../Data/Interfaces/Repositories/IUserRepository";
import * as multer from "multer";
import * as path from "path";

export function baseResponse(res, data: any = {}, message: string = "", token: any = undefined, status: string = "ok", statusCode = 200) {

    if (typeof res === 'undefined') {
        return new Error('response object is not set')
    }

    let response = {}
    if (typeof token === 'undefined') {

        response = {
            status,
            message,
            data,
        }

        res.status(statusCode).send(response)
        return
    }

    response = {
        status,
        message,
        data,
        token
    }

    res.status(statusCode).send(response)

}

export function asyncWrapper(fn: Function) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}


export function notFoundedResponse(res: Response) {
    return baseResponse(
        res,
        null,
        'Not Founded.',
        undefined,
        'NotFound',
        404
    );
}

export function duplicateError(res: Response) {
    return baseResponse(
        res,
        null,
        'Duplicate.',
        undefined,
        ResultStatus.Duplicate,
        400
    );
}

export function serverErrorResponse(res: Response, status: string) {
    return baseResponse(
        res,
        null,
        'Internal Sever Error.',
        undefined,
        status,
        500
    );
}


export function unAuth(res) {
    return baseResponse(
        res,
        null,
        'Un Authorize.',
        undefined,
        ResultStatus.NotAuthorized,
        401
    );
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploades/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + "-" + Date.now() + path.extname(file.originalname));
    }
});


export let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg"));
        }
    },
    limits: {fileSize: 5 * 1024 * 1024}
}).single('image');