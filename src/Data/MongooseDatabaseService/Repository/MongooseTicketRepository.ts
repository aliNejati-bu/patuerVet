import {ITicketRepository} from "../../Interfaces/Repositories/ITicketRepository";
import {Message, Ticket} from "../../Entities/Ticket";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";
import {BaseDataError} from "../../Errors/BaseDataError";
import MongooseTicketModel from "../Model/MongooseTicketModel";
import {injectable} from "inversify";

@injectable()
export class MongooseTicketRepository implements ITicketRepository {
    async addMessage(_id: string, message: Message): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseTicketModel.updateOne({
                    _id
                },
                {
                    $push: {
                        messages: message
                    }
                });

            return new BaseDataResult<boolean>(
                result.matchedCount != 0,
                result.matchedCount == 0
            );
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async create(ticket: Ticket): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseTicketModel.create(ticket);
            return new BaseDataResult<boolean>(true, false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async findById(_id: string): Promise<BaseDataResult<Ticket>> {
        try {
            let result = await MongooseTicketModel.findById(_id);
            if (!result) {
                return new BaseDataResult<Ticket>(null, true);
            }

            return new BaseDataResult<Ticket>(result.toObject(), false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

    async findUserTickets(userId: string): Promise<BaseDataResult<Ticket[]>> {
        try {
            let result = await MongooseTicketModel.find({
                userID: userId
            });

            let data = result.map(e => e.toObject());

            return new BaseDataResult<Ticket[]>(data, false);
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);

        }
    }

    async updateById(_id: string, ticket: Ticket): Promise<BaseDataResult<boolean>> {
        try {
            let result = await MongooseTicketModel.updateOne({
                _id
            }, {
                $set: ticket
            });

            return new BaseDataResult<boolean>(
                result.matchedCount != 0,
                result.matchedCount == 0
            )
        } catch (e) {
            throw new BaseDataError("Error while creating user", e);
        }
    }

}