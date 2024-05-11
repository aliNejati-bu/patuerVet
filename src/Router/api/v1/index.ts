import {Router} from "express";
import ExampleController from "../../../Controller/Controllers/Api/TwitterController";
import AuthController from "../../../Controller/Controllers/Api/AuthController";
import TwitterController from "../../../Controller/Controllers/Api/TwitterController";
import AiController from "../../../Controller/Controllers/Api/AiController";
import ReportController from "../../../Controller/Controllers/Api/ReportController";
import PaymentController from "../../../Controller/Controllers/Api/PaymentController";
import MediaController from "../../../Controller/Controllers/Api/MediaController";
import LinkedinController from "../../../Controller/Controllers/Api/LinkedinController";


const router = Router();
router.use(ExampleController().setupActions());
router.use(AuthController().setupActions());
router.use(TwitterController().setupActions());
router.use(AiController().setupActions());
router.use(ReportController().setupActions());
router.use(PaymentController().setupActions());
router.use(MediaController().setupActions());
router.use(LinkedinController().setupActions());

export default router;