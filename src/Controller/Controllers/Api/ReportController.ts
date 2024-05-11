import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import {container} from "../../../Container";
import {baseResponse, notFoundedResponse, serverErrorResponse, unAuth} from "../../../helpers/functions";
import {ReportApp} from "../../../App/Logic/ReportApp";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";




class ReportController extends Controller {

    constructor(
        private _report: ReportApp
    ) {
        super("/report");
    }

    async getGenerateReport(req: Request, res: Response, next: NextFunction) {
        let result = await this._report.getUserReport(req.body.user._id,req.query.date as any);
        if (result.isError){
            return serverErrorResponse(res,result.ResultStatus);
        }
        return baseResponse(res,result.result);
    }

}

export default function (): ReportController {
    const controller = new ReportController(
        container.get<ReportApp>(ReportApp)
    );

    controller.addAction('/generate','get',controller.getGenerateReport,[
        verifyClientToken
    ]);

    return controller;
}