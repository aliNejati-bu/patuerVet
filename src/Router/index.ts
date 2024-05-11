import {Express} from "express";
import {router} from "./routerLogger";
import api from "./api";
import ui from "./ui";
import {HttpContext} from "../App/Model/Param/HttpContext";

export class Router {
    init(app: Express) {
        app.use(router);

        app.set("trust proxy", true);

        app.use((req, res, next) => {
            req.body.httpContext = new HttpContext(req.ip);
            next()
        });
        // api router
        app.use("/api", api);
        app.use('/', ui);
    }
}

export default new Router();