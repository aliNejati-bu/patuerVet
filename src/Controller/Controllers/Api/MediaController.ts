import {Controller} from "../../index";
import e, {NextFunction, Request, Response} from "express";
import {container} from "../../../Container";
import {baseResponse, notFoundedResponse, serverErrorResponse, unAuth, upload} from "../../../helpers/functions";
import {ReportApp} from "../../../App/Logic/ReportApp";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";
import {ResultStatus} from "../../../App/Model/Result/ResultStatus";


class MediaController extends Controller {

    constructor() {
        super("/media");
    }

    async saveFile(req: Request, res: Response, next: NextFunction) {
        upload(req, res, (err) => {
            if (err) {
                return baseResponse(res, err, '', undefined, ResultStatus.Invalid);
            }

            console.log(req.files);

            let path = req.file.path
            path = path.replace('public', '');
            path = path.replace("\\\\", '\\');
            console.log(path)
            return baseResponse(res, {
                data: path
            });
        });
    }

}

export default function (): MediaController {
    const controller = new MediaController(
    );

    controller.addAction('/img', 'post', controller.saveFile)

    return controller;
}