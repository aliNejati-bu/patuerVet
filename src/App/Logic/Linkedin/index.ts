import {inject, injectable} from "inversify";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IUserRepository} from "../../../Data/Interfaces/Repositories/IUserRepository";

const {AuthClient} = require('linkedin-api-client');


let linkedinData = {
    clientID: "78z8w8y2iwydhs",
    clientSecret: "GWUMRxhLEgpo8VA6",
    redirect: "http://localhost/veify"
};

@injectable()
export class Linkedin {

    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(DataTypes.IUserRepository) private _userRepository: IUserRepository;

    async generateAuthLink(userEmail: string) {
        try {
            const authClient = new AuthClient({
                clientSecret: linkedinData.clientSecret,
                clientId: linkedinData.clientID,
                redirectUrl: linkedinData.redirect,
            });
            let linkedinID = this._idService.generate();
            let str = authClient.generateMemberAuthorizationUrl([
                'openid',
                'profile',
                'w_member_social',
                'email',
            ], linkedinID);

            await this._userRepository.addLinkedin(
                userEmail,
                {
                    linkedinId: linkedinID,
                    codeVerifier: null,
                    token: null,
                    redirectURL: linkedinData.redirect,
                    isActivated: false,
                    refreshToken: null,
                    expireAt: null
                }
            );
            return new BaseAppResult(str, false, '', ResultStatus.Success);
        } catch (e) {
            console.log(e.response.data)
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async verifyLinkedin(code: string, linkedinID: string) {
        try {
            const authClient = new AuthClient({
                clientSecret: linkedinData.clientSecret,
                clientId: linkedinData.clientID,
                redirectUrl: linkedinData.redirect,
            });

            let result = await authClient.exchangeAuthCodeForAccessToken(code);
            let user = await this._userRepository.findUserByUserByLinkedinId(linkedinID);
            if (user.isError) {
                return new BaseAppResult(
                    null,
                    true,
                    'user not founded.',
                    ResultStatus.NotFound
                );
            }

            await this._userRepository.updateLinkedinObject(user.data.email, {
                refreshToken: '',
                isActivated: true,
                redirectURL: linkedinData.redirect,
                token: result.access_token,
                codeVerifier: code,
                linkedinId: linkedinID,
                expireAt: parseInt((Date.now() / 1000) as any) + result.expires_in
            });
            return new BaseAppResult(true, false, '', ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async instantPost(userEmail: string, content: string, linkedinID: string) {
        try {
            let userData = await this._userRepository.findByEmail(userEmail);
            if (userData.isError) {
                return new BaseAppResult(
                    null,
                    true,
                    'user not founded.',
                    ResultStatus.NotFound
                );
            }
            let linkedin = userData.data.linkedins.find(e => {
                return e.linkedinId == linkedinID;
            });
            if (!linkedin) {
                return new BaseAppResult(
                    null,
                    true,
                    'linkedin founded.',
                    ResultStatus.NotFound
                );
            }

            if (!linkedin.isActivated) {
                return new BaseAppResult(
                    null,
                    true,
                    'linkedin founded.',
                    ResultStatus.NotFound
                );
            }

            const authClient = new AuthClient({
                clientSecret: linkedinData.clientSecret,
                clientId: linkedinData.clientID,
                redirectUrl: linkedinData.redirect,
            });

            let client = await authClient.introspectAccessToken(linkedin.token);


            return new BaseAppResult(
                '',
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

}