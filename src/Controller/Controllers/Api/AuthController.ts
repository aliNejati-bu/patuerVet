import {Controller} from "../../index";
import {UserValidator} from "../../../Middleware/Validators/UserValidator";
import {Auth} from "../../../App/Logic/Auth";
import {container} from "../../../Container";



class AuthController extends Controller {

    constructor(
        private _auth: Auth,
        public _userValidator: UserValidator
    ) {
        super("/auth");
    }



}

export default function (): AuthController {
    const controller = new AuthController(
        container.get(Auth),
        container.get(UserValidator)
    );


    return controller;
}