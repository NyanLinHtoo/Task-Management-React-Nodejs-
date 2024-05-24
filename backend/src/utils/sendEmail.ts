import nodeMailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import Handlebars from "handlebars";
dotenv.config();

const sendEmail = async (
    receiverMail: string,
    subject: string,
    sendData: any,
    htmlFile: string
) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.POSTGRES_HOST,
            service: process.env.SERVICE,
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });
        fs.readFile(htmlFile, "utf8", (err, html) => {
            if (err) {
                console.error('Error reading html template:', err);
                return;
            }
            const compiledTemplate = Handlebars.compile(html);
            const template = compiledTemplate(sendData);
            transporter
                .sendMail({
                    to: receiverMail,
                    from: process.env.USER,
                    subject: subject,
                    html: template,
                })
                .then(() => console.log("Email sent successfully!"))
                .catch((error) => {
                    console.error(error);
                });
        });
    } catch (error) {
        console.error(error, "email not sent");
    }
};

export default sendEmail;