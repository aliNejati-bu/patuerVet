import {IReportRepository} from "../../Interfaces/Repositories/IReportRepository";
import {Report, TypeOfReport} from "../../Entities/Report";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import MongooseReportModel from "../Model/MogooseReportModel"
import {BaseDataError} from "../../Errors/BaseDataError";
import {User} from "../../Entities/User";
import {injectable} from "inversify";

@injectable()
export class MongooseReportRepository implements IReportRepository {
    async findByAfterDate(date: Date, userID?: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>> {
        let filter = {
            createdAt: {
                $gte: date
            }
        };
        if (userID) {
            filter['userID'] = userID;
        }

        if (type) {
            filter['typeOf'] = type;
        }


        try {
            let result = await MongooseReportModel.find(filter);
            if (offset) {
                // @ts-ignore
                result = result.skip(offset);
            }

            if (limit) {
                // @ts-ignore
                result = result.limit(limit);
            }

            result = result.map(e => e.toObject());
            return new BaseDataResult<Report[]>(
                result,
                false
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async findUserReports(userID: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>> {
        try {
            let filter = {
                userID
            };

            if (type) {
                filter['typeOf'] = type;
            }

            let result = await MongooseReportModel.find(filter);
            if (offset) {
                // @ts-ignore
                result = result.skip(offset);
            }

            if (limit) {
                // @ts-ignore
                result = result.limit(limit);
            }
            result = result.map(e => e.toObject());
            return new BaseDataResult<Report[]>(
                result,
                false
            );

        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async insert(report: Report): Promise<BaseDataResult<Report>> {
        try {
            const mongooseUser = new MongooseReportModel(report);
            let result = await mongooseUser.save();
            return new BaseDataResult<Report>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async getUnDeletedReport(userID: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>> {
        try {
            let filter = {
                userID,
                isDelete: false
            };

            if (type) {
                filter['typeOf'] = type;
            }

            let result = await MongooseReportModel.find(filter);
            if (offset) {
                // @ts-ignore
                result = result.skip(offset);
            }

            if (limit) {
                // @ts-ignore
                result = result.limit(limit);
            }
            result = result.map(e => e.toObject());
            return new BaseDataResult<Report[]>(
                result,
                false
            );

        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async getUnDeletedReportAfterSelectedTime(date: Date, userID?: string, type?: TypeOfReport, limit?: number, offset?: number): Promise<BaseDataResult<Report[]>> {
        let filter = {
            createdAt: {
                $gte: date
            },
            isDelete: false
        };
        if (userID) {
            filter['userID'] = userID;
        }

        if (type) {
            filter['typeOf'] = type;
        }


        try {
            let result = await MongooseReportModel.find(filter);
            if (offset) {
                // @ts-ignore
                result = result.skip(offset);
            }

            if (limit) {
                // @ts-ignore
                result = result.limit(limit);
            }

            result = result.map(e => e.toObject());
            return new BaseDataResult<Report[]>(
                result,
                false
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async getCountAfterDte(date: Date, userID: string): Promise<BaseDataResult<number>> {
        try {
            let result = await MongooseReportModel.count({
                createdAt: {
                    $gte: date
                },
                userID: userID
            });
            return new BaseDataResult<number>(result, false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }


}