import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { sendEmailDTO } from './dto/mail.dto';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService
    ){}

    async sendEmail(body: sendEmailDTO): Promise<ConfirmationMsg>{
        const {to, from, html, subject} = body;
        const result = await this.mailerService.sendMail({
            to,
            from,
            subject,
            html
        })
        return {
            id: result.messageId,
            message: "Email sent to " + to
        }
    }
}
