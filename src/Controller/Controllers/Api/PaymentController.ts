import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import * as Shepa from 'shepa-payment-getaway';
import {Auth} from "../../../App/Logic/Auth";
import {container} from "../../../Container";
import {baseResponse, notFoundedResponse, serverErrorResponse} from "../../../helpers/functions";
import {ResultStatus} from "../../../App/Model/Result/ResultStatus";
import MongooseUserModel from "../../../Data/MongooseDatabaseService/Model/MongooseUserModel";
import {Payment} from "../../../App/Logic/Payment";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";

const gateway = new Shepa('sandbox');


let objs = {};

function addPayment(id, deatial: any) {
    objs[id] = deatial;
    setTimeout(() => {
        delete objs[id];
    }, 60000);
}

class PaymentController extends Controller {

    constructor(
        private authApp: Auth,
        private paymentApp: Payment
    ) {
        super("/payment");
    }

    async payment(req: Request, res: Response, next: NextFunction) {
        let serverAdr = process.env.APP_URI;
        let type = req.query.type;
        let period = req.query.period;
        let amount;
        let userId = req.query.user;

        let user = await this.authApp.getUserDataById(userId as string);
        if (user.isError) {
            return notFoundedResponse(res);
        }
        if (type == "2") {
            if (period == 'm') {
                amount = 8;
            } else {
                amount = 80;
            }
        } else {
            if (period == 'm') {
                amount = 80;
            } else {
                amount = 850;
            }
        }
        addPayment(userId, {
            period,
            type,
            amount: amount * 1000
        });
        gateway.send(amount * 1000, req.body.url, "9123333333", 'info@shepa.com', "توضیحات در سندباکس الزامی است")
            .then(link => baseResponse(res, {
                'url': link
            }))
            .catch(error => res.end("<head><meta charset='utf8'></head>" + error));
    };

    async verify(req: Request, res: Response, next: NextFunction) {
        let token = req.query.token;
        let status = req.query.status;
        let userID = req.query.userID;
        if (objs.hasOwnProperty(userID as string)) {
            let object = objs[userID as string];
            gateway.verify(token, object.amount)
                .then(async (data) => {
                    let exp = 2592000;
                    if (object.period == 'm') {
                        exp = 2592000;
                    } else {
                        exp = 31536000;
                    }
                    await this.paymentApp.updateProfileStatus(userID as string, object.type, parseInt((Date.now() / 1000) as any) + exp);
                    await this.paymentApp.addPaymentHistory(userID as string, new Date(), object.amount, object.type, Date.now())
                    return baseResponse(res, {}, 'updated');
                }).catch(e => {
                console.error(e);
                return baseResponse(res, {}, 'invalid code.', undefined, ResultStatus.Invalid, 400);
            })
        } else {
            return notFoundedResponse(res);
        }


    }

    async showPaymentHistory(req: Request, res: Response, next: NextFunction) {
        let id = req.body.user._id;
        let result = await this.paymentApp.showPaymentHistory(id);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, result.ResultStatus);
            } else {
                return notFoundedResponse(res);
            }
        }

        return baseResponse(res, result.result);
    }

    async getCount(req: Request, res: Response, next: NextFunction) {
        let result = await this.paymentApp.getCurrent(req.body.user._id);
        if (result.isError) {
            if (result.ResultStatus == ResultStatus.Unknown) {
                return serverErrorResponse(res, result.ResultStatus);
            } else {
                return notFoundedResponse(res);
            }
        }

        return baseResponse(res, result.result);
    }

}

export default function (): PaymentController {
    const controller = new PaymentController(
        container.get<Auth>(Auth),
        container.get(Payment)
    );

    controller.addAction('/pay', 'post', controller.payment)

    controller.addAction('/verify', 'get', controller.verify)

    controller.addAction('/payment-history', 'get', controller.showPaymentHistory, [
        verifyClientToken
    ]);

    controller.addAction('/courant', 'get', controller.getCount, [
        verifyClientToken
    ]);

    return controller;
}