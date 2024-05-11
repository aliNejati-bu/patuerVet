import {Message, Ticket} from "../../Entities/Ticket";
import {BaseDataResult} from "../../Model/Result/BaseDataResult";

export interface ITicketRepository {
    create(ticket: Ticket): Promise<BaseDataResult<boolean>>;

    findUserTickets(userId: string): Promise<BaseDataResult<Ticket[]>>;

    findById(_id: string): Promise<BaseDataResult<Ticket>>;

    updateById(_id: string, ticket: Ticket): Promise<BaseDataResult<boolean>>;

    addMessage(_id: string, message: Message): Promise<BaseDataResult<boolean>>;
}