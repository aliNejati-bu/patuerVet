import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import {Report, TypeOfReport} from "../../Entities/Report";

export interface IReportRepository {
    findByAfterDate(date: Date, userID?: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>>;

    findUserReports(userID: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>>;

    insert(report: Report): Promise<BaseDataResult<Report>>;

    getUnDeletedReport(userID: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>>;

    getUnDeletedReportAfterSelectedTime(date: Date, userID?: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>>;


    getCountAfterDte(date:Date,userID:string):Promise<BaseDataResult<number>>;
}