import resend from "../../application/user-casers/Resend"
import { EMAIL_SENDER, NODE_ENV } from "./env";


type Params = {
    to : string;
    subject : string;
    text : string;
    html : string;
}
const getFromEmail = () => 
    NODE_ENV === "development" ? "onboading@resend.dev" : EMAIL_SENDER;

const getToEmail = (to : string)  =>
    NODE_ENV === "development" ? "delivered@resend.dev" : to

export const sendMail = async({to , subject  , text , html}: Params) :Promise<any> =>{
    await resend.emails.send({
        from:getFromEmail(),
        to:getToEmail(to), 
        subject,
        text,
        html,
    })
}