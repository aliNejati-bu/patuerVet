import {injectable} from "inversify";
import {IMailService} from "../../Interfaces/IMailService";
import * as nodemailer from "nodemailer";


@injectable()
export class SMTPMailService implements IMailService {
    sendVerificationMail(email: string, token: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                },
                from: process.env.SMTP_FROM,
                tls: {
                    ciphers: 'SSLv3'
                }

            });
            try {
                const info = await transporter.sendMail({
                    from: `virabble <${process.env.SMTP_FROM}>`,
                    to: email,
                    subject: "Verify your email",
                    text: `Code: ${token}`
                });
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    }

}