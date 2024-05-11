import {inject, injectable} from "inversify";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {ITokenService} from "../../Interfaces/TokenService/ITokenService";
import {IPasswordService} from "../../Interfaces/PasswordService/IPasswordService";
import {IMailService} from "../../Interfaces/IMailService";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IUserRepository} from "../../../Data/Interfaces/Repositories/IUserRepository";
import {AdminTokenPayload} from "../../Entities/AdminTokenPayload";
import {User} from "../../../Data/Entities/User";


@injectable()
export class Auth {

    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(TYPES.ITokenService) private _tokenService: ITokenService
    @inject(TYPES.IPasswordService) private _passwordService: IPasswordService;
    @inject(TYPES.IMailService) private _mailService: IMailService;
    @inject(DataTypes.IUserRepository) private _userRepository: IUserRepository;

    public async generateTokenByMobileAndPassword(mobile: string, password: string) {
        try {
            // get token secret from environment
            let tokenSecret = process.env.TOKEN_SECRET;

            // check if token secret not exists return error
            if (!tokenSecret) {
                this._loggerService.error("Token secret not exists.");
                return new BaseAppResult<{ token: string; lifeTime: number } | null>(
                    null,
                    true,
                    "Token secret not exists.",
                    ResultStatus.Unknown
                )
            }

            // get token lifetime from environment
            let tokenLifeTime = process.env.TOKEN_LIFE_TIME ?? 86400;


            const user = await this._userRepository.findUserByMobile(mobile);
            if (user.isError) {
                return new BaseAppResult(null, true, "", ResultStatus.NotFound)
            }
            if (user.data.password) {
                const result = await this._passwordService.verify(password,user.data.password);
                if (result){
                    let token = await this._tokenService.createToken(new AdminTokenPayload(user.data._id as any as string, ["admin"], user.data.mobile).toPlainObject(), tokenSecret, +tokenLifeTime);
                    return new BaseAppResult(
                        {
                            token,
                            tokenLifeTime
                        },
                        false,
                        "",
                        ResultStatus.Success
                    )
                }else {
                    return new BaseAppResult(null,true,"",ResultStatus.NotMatch)

                }
            } else {
                if (mobile == user.data.mobile) {
                    let token = await this._tokenService.createToken(new AdminTokenPayload(user.data._id as any as string, ["admin"], user.data.mobile).toPlainObject(), tokenSecret, +tokenLifeTime);
                    return new BaseAppResult(
                        {
                            token,
                            tokenLifeTime
                        },
                        false,
                        "",
                        ResultStatus.Success
                    )
                }else {
                    return new BaseAppResult(null,true,"",ResultStatus.NotMatch)
                }
            }
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null | {
                id: string,
                token: string
            }>(null, true, "Error creating user", ResultStatus.Unknown);
        }
    }

    async verifyAdminToken(token: string): Promise<BaseAppResult<AdminTokenPayload | null>> {
        try {
            // get token secret from environment
            let tokenSecret = process.env.TOKEN_SECRET;

            // check if token secret not exists return error
            if (!tokenSecret) {
                return new BaseAppResult<AdminTokenPayload | null>(null, true, "Token secret not exists.", ResultStatus.Unknown)
            }

            // verify token
            let verifyTokenResult = await this._tokenService.verifyToken<AdminTokenPayload>(token, tokenSecret);
            if (!verifyTokenResult) {
                return new BaseAppResult<AdminTokenPayload | null>(null, true, "Invalid token.", ResultStatus.Invalid)
            }

            if (!(verifyTokenResult as AdminTokenPayload).scope.includes("admin")) {
                return new BaseAppResult<AdminTokenPayload | null>(null, true, "Invalid token.", ResultStatus.Invalid)
            }

            return new BaseAppResult<AdminTokenPayload | null>(
                verifyTokenResult as AdminTokenPayload,
                false,
                "Token verified.",
                ResultStatus.Success
            )
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<AdminTokenPayload | null>(null, true, "Error.", ResultStatus.Unknown)
        }
    }

    async getUserDataByMobile(mobile: string): Promise<BaseAppResult<User | null>> {
        try {
            const user = await this._userRepository.findUserByMobile(mobile);
            if (user.isError) {
                return new BaseAppResult<User | null>(
                    null,
                    true,
                    'User not exists.',
                    ResultStatus.NotFound
                )
            }


            return new BaseAppResult<User | null>(
                user.data,
                false,
                'user got',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<User | null>(null, true, "Error.", ResultStatus.Unknown)
        }
    }

}