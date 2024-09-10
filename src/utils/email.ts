// EMAIL HANDLER FUNCTION
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

const sendEmail = async (options: any) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as SMTPTransport.Options);

  // 2) Define the email options
  const mailOptions = {
    from: "Felipe Magalhaes <test@test.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
