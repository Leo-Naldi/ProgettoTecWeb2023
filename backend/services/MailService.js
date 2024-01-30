const Service = require("./Service");
const config = require("../config");
const VerificationCode = require("../models/VerificationCode");
const VerificationURL = require("../models/VerificationURL");
const User = require("../models/User");
const nodemailer = require("nodemailer");

class MailService {
  static randomVerificationCode() {
    let verification_code = "";
    for (let i = 0; i < 6; i++) {
      verification_code += parseInt(Math.random() * 10);
    }
    return verification_code;
  }

  static async handleCodeDb(email, verification_code) {
    await VerificationCode.deleteMany({ mail: email });

    const verificationCode_ = new VerificationCode({
      mail: email,
      verification_code: verification_code,
    });
    await verificationCode_.save();

    setTimeout(async () => {
      await VerificationCode.deleteMany({ mail: email });
    }, 1000 * 60 * 5); //5 min, 1000=1s
  }

  static generateVerificationURL(email, handle, token) {
    return (
      config.app_url +
      "verifyAccount/?email=" +
      email +
      "&handle=" +
      handle +
      "&token=" +
      token
    );
  }

  static async handleURLDb(email, verification_url) {
    await VerificationURL.deleteMany({ email: email });

    const verificationURL_ = new VerificationURL({
      email: email,
      verification_url: verification_url,
    });
    await verificationURL_.save();

    setTimeout(async () => {
      await VerificationURL.deleteMany({ email: email });
    }, 1000 * 60 * 5); //5 min, 1000=1s
  }

  static async verificationCodeMailTo(email) {
    var transporter = nodemailer.createTransport({
      service: config.mail_service,
      // host: config.mail_host, // if service is disabled
      auth: {
        user: config.mail_user,
        pass: config.mail_password,
      },
    });
    let verification_code = this.randomVerificationCode();

    //TODO:handle nodemailer send error
    let verification_html = `
    <p>Hello!</p>
    <p>Your verification code is: <strong style="color: #ff4e2a;">${verification_code}</strong></p>
    <p>***this verification code will valid in 5 minutes***</p>`;
    let verification_subjet = "test generate verification code";
    transporter.sendMail({
      from: `'"Squealer" <${config.mail_user}>'`,
      to: email,
      // to: reqUser.email,
      subject: verification_subjet,
      html: verification_html,
      // attachments: attachments,
    });

    this.handleCodeDb(email, verification_code);
  }

  static async verifyAccountMailTo(email, handle, token) {
    var transporter = nodemailer.createTransport({
      service: config.mail_service,
      // host: config.mail_host, // if service is disabled
      auth: {
        user: config.mail_user,
        pass: config.mail_password,
      },
    });
    let verification_url = this.generateVerificationURL(email, handle, token);

    //TODO:handle nodemailer send error
    let verification_html = `
    <p>Hello!</p>
    <p>You can click this url to verify your account: <strong style="color: #ff4e2a;">${verification_url}</strong></p>
    <p>***this verify url will valid in 5 minutes***</p>`;
    let verification_subjet = "Squealer: verify your account";
    transporter.sendMail({
      from: `'"Squealer" <${config.mail_user}>'`,
      to: email,
      // to: reqUser.email,
      subject: verification_subjet,
      html: verification_html,
      // attachments: attachments,
    });

    this.handleURLDb(email, verification_url);
  }

  static async verifyCode({ mail, verification_code }) {
    // console.log("reqUSer: ", )
    // console.log("reqUSer-email: ", mail)
    // console.log("insert-code: ", verification_code)
    const res = await VerificationCode.findOne({
      mail: mail,
      verification_code: verification_code,
    });
    if (res != null) {
      await VerificationCode.deleteMany({ mail: mail });
      let user = await User.findOne({ email: mail })
      user.password = verification_code;
      try {
        user = await user.save();
      } catch (e) {
        err = e;
        console.log("user not found: ", e)
      }
      return Service.successResponse("verification code correct");
    }
    return Service.rejectResponse({ message: "verification code not correct" });
  }

  static async verifyAccount({ handle, email, verification_url }) {
    const res = await VerificationURL.findOne({
      email: email,
      verification_url: verification_url,
    });
    if (res != null) {
      console.log("email-verification_url pair found")
      await VerificationURL.deleteMany({ email: email });
      // res
      let user = await User.findOne({ email: email })
      user.verified = true;
      let err;
      try {
        user = await user.save();
      } catch (e) {
        err = e;
        console.log("user not found: ", e)
      }
      //TODO:socket inform
      if (err) return Service.rejectResponse(err);
      return Service.successResponse("verified your account success");
    }
    else{
      console.log("email-verification_url pair not found: ", email, verification_url)

    }
    return Service.rejectResponse({ message: "verify account failed" });
  }
}

module.exports = MailService;
