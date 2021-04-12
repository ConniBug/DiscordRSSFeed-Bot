var nodemailer = require("nodemailer");

require("dotenv").config();

var transporter = nodemailer.createTransport({
  host: "mail.spookiebois.club",
  port: 587,
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
});

module.exports.sendMail = async (to_t, content, subject = "Tranquility") => {
  var mailOptions = {
    from: process.env.EMAIL,
    to: to_t,
    subject: `${subject}`,
    html: `${content}`, // html body
    // text: 'That was easy!',
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
  });
};
