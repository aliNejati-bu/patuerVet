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


    generateAuthLink(req: Request, res: Response, next: NextFunction) {
        /*const data = client.generateOAuth2AuthLink('http://127.0.0.1:3000/twitter/verify', {
            scope: ['tweet.write', 'tweet.read', 'offline.access', 'users.read']
        });
        obj.codeVerifier = data.codeVerifier;
        obj.state = data.state;

        return res.redirect(data.url);*/

        return res.sendFile(path.join(__dirname, '../../../public/index.html'));
    }


    login(req: Request, res: Response, next: NextFunction) {
        return res.sendFile(path.join(__dirname, '../../../public/login.html'));
    }

    /*async verifyAuth(req: Request, res: Response, next: NextFunction) {
        const {stats, code} = req.query;

        const {client: cli} = await client.loginWithOAuth2({
            redirectUri: "http://127.0.0.1:3000/twitter/verify",
            codeVerifier: obj.codeVerifier,
            code: code as string
        });

        await cli.v2.tweet({
            text: "skfopsepfj"
        });
        res.send('test from bot');
    }*/

    dash(req: Request, res: Response, next: NextFunction) {

        return res.sendFile(path.join(__dirname, '../../../public/dashboard.html'));

    }
}

export default function (): IndexController {
    const controller = new IndexController();

    controller.addAction('', 'get', controller.generateAuthLink)
    controller.addAction('login', 'get', controller.login)
    controller.addAction('dashboard','get',controller.dash);
    return controller;
}