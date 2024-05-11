import {inject, injectable} from "inversify";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IReportRepository} from "../../../Data/Interfaces/Repositories/IReportRepository";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {Report, TypeOfReport} from "../../../Data/Entities/Report";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";

@injectable()
export class ReportApp {
    @inject(DataTypes.IReportRepository) private _reportRepository: IReportRepository;
    @inject(TYPES.IIDService) private _idService: IIDService;
    @inject(UtilsTypes.ILoggerService) private _loggerService: ILoggerService;

    async getUserReport(userID: string, date?: Date, reportType?: TypeOfReport) {
        try {
            let result;
            if (!date)
                result = await this._reportRepository.getUnDeletedReport(userID, reportType);
            else
                result = await this._reportRepository.getUnDeletedReportAfterSelectedTime(date, userID, reportType);
            return new BaseAppResult(
                result.data,
                false,
                "",
                ResultStatus.Success
            )
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<any>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async createReport(ip: string, userID: string, type: TypeOfReport) {
        try {
            let id = this._idService.generate();
            let report = new Report(
                id,
                type,
                ip,
                userID,
                new Date()
            );

            let result = await this._reportRepository.insert(report);
            return new BaseAppResult(
                id,
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