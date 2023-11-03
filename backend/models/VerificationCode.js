const mongoose = require('mongoose');

/**
 * VerificationCodes schema, every like is saved as a (mail, verification_code) double
 */
const VerificationCodeSchema = new mongoose.Schema({
    mail: {
        type: String, 
        required: true,
    },
    verification_code: {
        type: String,
        required: true,
    },
})

// Ensure the combinaton of (user, verification_code) is unique
VerificationCodeSchema.index({ mail: 1, verification_code: 1}, { unique: true });


const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);


module.exports = VerificationCode;