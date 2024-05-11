import {inject, injectable} from "inversify";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IUserRepository} from "../../../Data/Interfaces/Repositories/IUserRepository";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {User} from "../../../Data/Entities/User";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {ITokenService} from "../../Interfaces/TokenService/ITokenService";
import {IPasswordService} from "../../Interfaces/PasswordService/IPasswordService";
import {AdminTokenPayload} from "../../Entities/AdminTokenPayload";
import {IMailService} from "../../Interfaces/IMailService";
import axios from "axios";

let googleConfig = {
    cid: "844345253978-4bl6evuu9va68ja6m3eano0g3o3goqp9.apps.googleusercontent.com",
    client_secret: "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",
    redirectURI: "https://app.virabble.com/auth/google-verifier"
}

@injectable()
export class Auth {

    @inject(DataTypes.IUserRepository) private _userRepository: IUserRepository;
    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(TYPES.ITokenService) private _tokenService: ITokenService
    @inject(TYPES.IPasswordService) private _passwordService: IPasswordService;
    @inject(TYPES.IMailService) private _mailService: IMailService;

    async createUser(name: string, lastName: string, email: string, password: string): Promise<BaseAppResult<null | {
        id: string,
        token: string
    }>> {
        try {
            const userExists = await this._userRepository.findByEmail(email);
            if (!userExists.isError) {
                return new BaseAppResult<null | {
                    id: string,
                    token: string
                }>(null, true, "User already exists", ResultStatus.Duplicate);
            }
            const user = new User(
                this._idService.generate(),
                name,
                lastName,
                email,
                await this._passwordService.hash(password),
                new Date(),
                new Date()
            );

            const result = await this._userRepository.create(user);

            let tokenSecret = process.env.TOKEN_SECRET;

            let tokenLifeTime = process.env.TOKEN_LIFE_TIME ?? 86400;


            // generate token
            let token = await this._tokenService.createToken(new AdminTokenPayload(user._id, ["admin"], user.email).toPlainObject(), tokenSecret, +tokenLifeTime);

            this.generateVerifyEmail(user.email);

            return new BaseAppResult<{ id: string, token: string } | null>(
                {
                    id: user._id,
                    token
                },
                false,
                "user created.",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null | {
                id: string,
                token: string
            }>(null, true, "Error creating user", ResultStatus.Unknown);
        }
    }

    async getTokenByEmailAndPassword(email: string, password: string): Promise<BaseAppResult<null | {
        token: string,
        lifeTime: number
    }>> {
        try {

            // get user from repository
            let user = await this._userRepository.findByEmail(email);

            // check if user not exists login filed.
            if (user.isError) {
                return new BaseAppResult<{ token: string; lifeTime: number } | null>(
                    null,
                    true,
                    "Email and password not match.",
                    ResultStatus.NotMatch
                )
            }

            // in this step user exists now check user password from password service
            let passwordCheckResult = await this._passwordService.verify(password, user.data.password);

            // check if password not match return error
            if (!passwordCheckResult) {
                return new BaseAppResult<{ token: string; lifeTime: number } | null>(
                    null,
                    true,
                    "Email and password not match.",
                    ResultStatus.NotMatch
                )
            }

            // in this step password match now generate token

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


            // generate token
            let token = await this._tokenService.createToken(new AdminTokenPayload(user.data._id, ["admin"], user.data.email).toPlainObject(), tokenSecret, +tokenLifeTime);

            // return token
            return new BaseAppResult<{ token: string; lifeTime: number } | null>(
                {
                    token,
                    lifeTime: +tokenLifeTime
                },
                false,
                "Token Generated.",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<{
                token: string;
                lifeTime: number
            } | null>(null, true, "Error creating user.", ResultStatus.Unknown)
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

    async getUserDataByEmail(email: string): Promise<BaseAppResult<User | null>> {
        try {
            const user = await this._userRepository.findByEmail(email);
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

    async getUserDataById(id: string): Promise<BaseAppResult<User | null>> {
        try {
            const user = await this._userRepository.findById(id);
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

    async generateVerifyEmail(userEmail: string): Promise<BaseAppResult<any>> {
        try {
            let code = Math.floor(Math.random() * 1000000).toString();
            let expireAt = new Date();
            expireAt.setMinutes(expireAt.getMinutes() + 5);
            let obj = {
                code,
                expireAt
            };
            await this._userRepository.addEmailCode(userEmail, obj);
            await this._mailService.sendVerificationMail(userEmail, code);
            return new BaseAppResult<any>(null, false, "Email sent", ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async verifyCode(userID: string, code: string): Promise<BaseAppResult<boolean>> {
        try {
            let user = await this._userRepository.findById(userID);
            if (user.data.verification.code != code) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    'invalid Code',
                    ResultStatus.Invalid
                );
            }

            if (user.data.verification.expireAt < new Date()) {
                return new BaseAppResult<boolean>(
                    false,
                    true,
                    'invalid Code',
                    ResultStatus.Invalid
                );
            }

            await this._userRepository.changeVerificationStatus(userID, true);
            return new BaseAppResult<boolean>(
                true,
                false,
                'verified',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async updateProfile(userID: string, firstName: string, lastName: string) {
        try {
            let result = await this._userRepository.findById(userID);
            if (result.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    '',
                    ResultStatus.NotFound
                );
            }
            result.data.name = firstName;
            result.data.lastName = lastName;
            let newData = await this._userRepository.updateUserEntityByID(userID,
                result.data
            );

            return new BaseAppResult(true,
                false,
                '',
                ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async updatePassword(userID: string, password: string) {
        try {
            let result = await this._userRepository.findById(userID);
            if (result.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    '',
                    ResultStatus.NotFound
                );
            }
            result.data.password = await this._passwordService.hash(result.data.password);
            let newData = await this._userRepository.updateUserEntityByID(userID,
                result.data
            );

            return new BaseAppResult(true,
                false,
                '',
                ResultStatus.Success);

        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async getGoogleAuthLin() {
        try {
            const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

            const options = {
                redirect_uri: googleConfig.redirectURI,
                client_id: googleConfig.cid,
                access_type: "offline",
                response_type: "code",
                prompt: "consent",
                scope: [
                    "https://www.googleapis.com/auth/userinfo.profile",
                    "https://www.googleapis.com/auth/userinfo.email",
                ].join(" "),
            };

            const qs = new URLSearchParams(options);

            return new BaseAppResult({
                    url: `${rootUrl}?${qs.toString()}`,
                },
                false,
                '',
                ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async verifyGoogle(code: string) {
        try {
            let values = {
                code,
                client_id: googleConfig.cid,
                client_secret: googleConfig.client_secret,
                redirect_uri: googleConfig.redirectURI,
                grant_type: "authorization_code",
            };
            const url = "https://oauth2.googleapis.com/token";
            const qs = new URLSearchParams(values);
            const res = await axios.post(
                url,
                qs.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const data = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${res.data.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${res.data.access_token}`,
                    },
                }
            );
            let searchResult = await this._userRepository.findByEmail(data.data.email);
            let tokenSecret = process.env.TOKEN_SECRET;

            let tokenLifeTime = process.env.TOKEN_LIFE_TIME ?? 86400;
            if (searchResult.isError) {
                let user = await this._userRepository.create(new User(
                        this._idService.generate(),
                        data.data.given_name,
                        data.data.family_name,
                        data.data.email,
                        "PASS" + Date.now().toString(),
                        new Date(),
                        new Date()
                    )
                );


                let token = await this._tokenService.createToken(new AdminTokenPayload(user.data._id, ["admin"], user.data.email).toPlainObject(), tokenSecret, +tokenLifeTime);
                return new BaseAppResult(
                    token,
                    false,
                    "",
                    ResultStatus.Success
                )


            } else {
                let token = await this._tokenService.createToken(new AdminTokenPayload(searchResult.data._id, ["admin"], searchResult.data.email).toPlainObject(), tokenSecret, +tokenLifeTime);
                return new BaseAppResult(
                    token,
                    false,
                    "",
                    ResultStatus.Success
                )
            }


        } catch (e) {
            console.log(e.response.data)
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


}