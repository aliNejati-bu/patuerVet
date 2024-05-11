export interface IMailService {
    sendVerificationMail(email: string, token: string): Promise<boolean>;
}