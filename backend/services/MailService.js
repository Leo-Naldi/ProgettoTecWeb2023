const Service = require("./Service");
const config = require("../config");
const VerificationCode = require('../models/VerificationCode');

const nodemailer = require("nodemailer");

class MailService {
  

  static async mailTo(email) {
    var transporter = nodemailer.createTransport({
      service: config.mail_service,
      // host: config.mail_host, // if service is disabled
      auth: {
        user: config.mail_user,
        pass: config.mail_password,
      },
    });

    function randomVerification() {
        let verification_code = "";
        for (let i = 0; i < 6; i++) {
          verification_code += parseInt(Math.random() * 10);
        }
        return verification_code;
      }

    let verification_code = randomVerification()

    

    let verification_html= `
    <p>Hello!</p>
    <p>Your verification code is: <strong style="color: #ff4e2a;">${verification_code}</strong></p>
    <p>***this verification code will valid in 5 minutes***</p>`     
    let verification_subjet="test generate verification code"

      transporter.sendMail({
        from: `'"Squealer" <${config.mail_user}>'`,
        to: email,
        // to: reqUser.email,
        subject: verification_subjet,
        html: verification_html,
        // attachments: attachments,
      });

    await VerificationCode.deleteMany({ mail: verification_destination })
    
    const verificationCode_ = new VerificationCode({ mail: verification_destination, verification_code: verification_code });
    await verificationCode_.save();

    setTimeout(async ()=>{   
        await VerificationCode.deleteMany({ mail: verification_destination })
    },1000*60*5) //1 min, 1000=1s

    
  }

  static async verifyCode({mail, verification_code}){
    // console.log("reqUSer: ", )
    console.log("reqUSer-email: ", mail)
    console.log("insert-code: ", verification_code)

    const res = await VerificationCode.findOne({ mail: mail, verification_code:verification_code })
    if (res!=null){
        await VerificationCode.deleteMany({ mail: mail })
        return Service.successResponse("verified success");
    }
    return Service.rejectResponse({ message: "verification code not correct" })


  }
}

module.exports = MailService;
