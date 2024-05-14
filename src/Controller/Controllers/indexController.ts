import {Controller} from "..";
import {NextFunction, Request, Response} from "express";
import {baseResponse} from "../../helpers/functions";
import {container} from "../../Container";
import {TYPES} from "../../App/Interfaces/Types";
import TwitterSDK from 'twitter-api-v2'
import {string} from "joi";
import * as path from "path";

/*const client = new TwitterSDK({
    clientId: '*',
    clientSecret: '*'
});

let obj = {
    codeVerifier: null,
    state: null
};*/

class IndexController extends Controller {

    constructor() {
        super("/");
    }


    login(req: Request, res: Response, next: NextFunction) {
        return res.sendFile(path.join(__dirname, '../../../public/login.html'));
    }

    forget(req: Request, res: Response, next: NextFunction) {
        return res.sendFile(path.join(__dirname, '../../../public/forget.html'));
    }
}

export default function (): IndexController {
    const controller = new IndexController();

    controller.addAction('login', 'get', controller.login);
    controller.addAction('forget', 'get', controller.forget);
    return controller;
}