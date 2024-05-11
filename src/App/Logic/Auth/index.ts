import {inject, injectable} from "inversify";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {ITokenService} from "../../Interfaces/TokenService/ITokenService";
import {IPasswordService} from "../../Interfaces/PasswordService/IPasswordService";
import {IMailService} from "../../Interfaces/IMailService";




@injectable()
export class Auth {

    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(TYPES.ITokenService) private _tokenService: ITokenService
    @inject(TYPES.IPasswordService) private _passwordService: IPasswordService;
    @inject(TYPES.IMailService) private _mailService: IMailService;





}