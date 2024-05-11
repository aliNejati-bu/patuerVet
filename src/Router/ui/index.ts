import {Router} from "express";
import IndexController from "../../Controller/Controllers/indexController";


const router = Router();
router.use(IndexController().setupActions());

export default router;