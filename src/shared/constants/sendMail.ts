
import { NODEMAILER_PASSWORD, SENDER_EMAIL } from "./env";
import nodemailer from "nodemailer"

type Params = {
    to: string;
    subject: string;
    text: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: SENDER_EMAIL,
        pass: NODEMAILER_PASSWORD
    },
});



export const sendMail = async ({ to, subject, text, html }: Params): Promise<any> => {
    const response = await transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        subject,
        text,
        html,
    })
}