const mongoose = require('mongoose');

/**
 * VerificationCodes schema, every like is saved as a (mail, verification_url) double
 */
const VerificationURLSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true,
    },
    verification_url: {
        type: String,
        required: true,
    },
})

// Ensure the combinaton of (user, verification_code) is unique
VerificationURLSchema.index({ email: 1, verification_url: 1}, { unique: true });


const VerificationURL = mongoose.model('VerificationURL', VerificationURLSchema);


module.exports = VerificationURL;