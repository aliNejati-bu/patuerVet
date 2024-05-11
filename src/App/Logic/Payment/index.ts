import {inject, injectable} from "inversify";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {IUserRepository} from "../../../Data/Interfaces/Repositories/IUserRepository";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import {IReportRepository} from "../../../Data/Interfaces/Repositories/IReportRepository";

@injectable()
export class Payment {
    @inject(DataTypes.IUserRepository) _userRepository: IUserRepository;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;
    @inject(DataTypes.IReportRepository) private _reportRepository: IReportRepository;

    async addPaymentHistory(userID: string, date: Date, amount: number, type: 2 | 3, numericName: number) {
        try {
            let result = await this._userRepository.addPaymentHistory(
                userID,
                {
                    amount,
                    date,
                    numericName,
                    type
                },
            );

            if (result.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    'error on adding payment',
                    ResultStatus.Invalid
                );
            }


            return new BaseAppResult(
                true,
                false,
                'added',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async updateProfileStatus(userID: string, status: 2 | 3, dateToEnd: number) {
        try {
            let result = await this._userRepository.updateUserStatusAndTime(userID, dateToEnd, status);
            if (result.isError) {
                return new BaseAppResult(
                    false,
                    true,
                    'error on adding payment',
                    ResultStatus.Invalid
                );
            }

            return new BaseAppResult(
                true,
                false,
                '',
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async showPaymentHistory(userID: string) {
        try {
            let result = await this._userRepository.showPayments(userID);

            return new BaseAppResult(
                result.data,
                result.isError,
                '',
                result.isError ? ResultStatus.NotFound : ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async getCurrent(userID: string) {
        try {
            let user = await this._userRepository.findById(userID);
            if (user.isError) {
                return new BaseAppResult(
                    null,
                    true,
                    '',
                    ResultStatus.NotFound
                )
            }

            let total;

            if (user.data.userType == 1) {
                total = 10;
            } else if (user.data.userType == 2) {
                total = 600;
            } else {
                total = 4500;
            }

            let date = new Date(user.data.periodStartAt);

            let countResult = await this._reportRepository.getCountAfterDte(date, user.data._id);

            return new BaseAppResult({
                    total,
                    count: countResult.data
                },
                false,
                '',
                ResultStatus.Success);
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

}