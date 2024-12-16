import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
});
export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject,
            html
        });
    }
    catch (error) {
        console.log(error);
    }
};
