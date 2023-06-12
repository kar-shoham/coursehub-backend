import nodemailer from "nodemailer";
import asyncWrapper from "../middlewares/asyncWrapper.js";

let sendMail = (message, to, subject) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text: message,
  };
  transporter.sendMail(mailOptions)

}


export default sendMail