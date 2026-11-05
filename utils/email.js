const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(option) {
  var transport = nodemailer.createTransport({
    host: process.env.HOST_MAILTRAP_URL,
    port: process.env.HOST_MAILTRAP_PORT,
    auth: {
      user: process.env.HOST_MAILTRAP_USER,
      pass: process.env.HOST_MAILTRAP_PASSWORD,
    },
  });

  try {
    const info = await transport.sendMail({
      from: process.env.HOST_MAILTRAP_FROM,
      to: option.userEmail,
      subject: option.subject,
      html: `<h1>${option.html}</h1>`,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (err) {
    console.err("Error sending email:", err);
    return false;
  }
}

module.exports = sendEmail;
