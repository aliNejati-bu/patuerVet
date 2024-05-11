// import inversify container
import {Container} from 'inversify';
import {ILoggerService} from '../Utils/Interfaces/LoggeService/ILoggerService';
import {ConsoleLoggerService} from '../App/Services/LoggerService/ConsoleLoggerService';
import {TYPES} from '../App/Interfaces/Types';
import {UserValidator} from "../Middleware/Validators/UserValidator";
import {BaseValidator} from "../Middleware/Validators/BaseValidator";
import {DataTypes} from "../Data/Interfaces/Types/DataTypes";
import {IDatabaseService} from "../Data/Interfaces/IDatabaseService";
import {MongooseDatabaseService} from "../Data/MongooseDatabaseService";
import {IUserRepository} from "../Data/Interfaces/Repositories/IUserRepository";
import {MongooseUserRepository} from "../Data/MongooseDatabaseService/Repository/MongooseUserRepository";
import {UtilsTypes} from "../Utils/Interfaces/Types/UtilsTypes";
import {IIDService} from "../App/Interfaces/IDService/IIDService";
import {UUIDService} from "../App/Services/IDService/UUIDService";
import {Auth} from "../App/Logic/Auth";
import {ITokenService} from "../App/Interfaces/TokenService/ITokenService";
import {JsonwebtokenTokenService} from "../App/Services/TokenService/JsonwebtokenTokenService";
import {IPasswordService} from "../App/Interfaces/PasswordService/IPasswordService";
import {BcryptPasswordService} from "../App/Services/PasswordService/BcryptPasswordService";
import {Twitter} from "../App/Logic/Twitter";
import {ITweetRepository} from "../Data/Interfaces/Repositories/ITweetRepository";
import {MongooseTweetRepository} from "../Data/MongooseDatabaseService/Repository/MongooseTweetRepository";
import {TweetValidator} from "../Middleware/Validators/TweetValidator";
import {IMailService} from "../App/Interfaces/IMailService";
import {SMTPMailService} from "../App/Services/SMTPMailService";
import {Ai} from "../App/Logic/Ai";
import {AiValidator} from "../Middleware/Validators/AiValidator";
import {IReportRepository} from "../Data/Interfaces/Repositories/IReportRepository";
import {MongooseReportRepository} from "../Data/MongooseDatabaseService/Repository/MongooseReportRepository";
import {ReportApp} from "../App/Logic/ReportApp";
import {Payment} from '../App/Logic/Payment';
import {ITicketRepository} from "../Data/Interfaces/Repositories/ITicketRepository";
import {MongooseTicketRepository} from "../Data/MongooseDatabaseService/Repository/MongooseTicketRepository";
import {Ticket} from "../App/Logic/Ticket";
import {Linkedin} from "../App/Logic/Linkedin";
import {LinkedinValidator} from "../Middleware/Validators/LinkedinValidator";


// create new container default in singleton mode
let container = new Container({defaultScope: 'Singleton'});

// bind utils layer
container.bind<ILoggerService>(UtilsTypes.ILoggerService).to(ConsoleLoggerService);


// bind app services
container.bind<IIDService>(TYPES.IIDService).to(UUIDService);
container.bind<ITokenService>(TYPES.ITokenService).to(JsonwebtokenTokenService);
container.bind<IPasswordService>(TYPES.IPasswordService).to(BcryptPasswordService);
container.bind<IMailService>(TYPES.IMailService).to(SMTPMailService);
container.bind<Ticket>(Ticket).to(Ticket);

//bind app implementations
container.bind<Auth>(Auth).to(Auth);
container.bind<Twitter>(Twitter).to(Twitter);
container.bind<Ai>(Ai).to(Ai);
container.bind<ReportApp>(ReportApp).to(ReportApp);
container.bind<Payment>(Payment).to(Payment);
container.bind<Linkedin>(Linkedin).to(Linkedin);

// bind repositories
container.bind<IDatabaseService>(DataTypes.IDatabaseService).to(MongooseDatabaseService);
container.bind<IUserRepository>(DataTypes.IUserRepository).to(MongooseUserRepository);
container.bind<ITweetRepository>(DataTypes.ITweetRepository).to(MongooseTweetRepository);
container.bind<IReportRepository>(DataTypes.IReportRepository).to(MongooseReportRepository);
container.bind<ITicketRepository>(DataTypes.ITicketRepository).to(MongooseTicketRepository);

// bind validator to container
container.bind<BaseValidator>(BaseValidator).to(BaseValidator);
container.bind<UserValidator>(UserValidator).to(UserValidator);
container.bind<TweetValidator>(TweetValidator).to(TweetValidator);
container.bind<AiValidator>(AiValidator).to(AiValidator);
container.bind<LinkedinValidator>(LinkedinValidator).to(LinkedinValidator);

export {container};