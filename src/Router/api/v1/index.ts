import {Router} from "express";
import AuthController from "../../../Controller/Controllers/Api/AuthController";



const router = Router();
router.use(AuthController().setupActions());

export default router;