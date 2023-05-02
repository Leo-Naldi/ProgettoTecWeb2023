const User = require('../models/User');
const Service = require('./Service');
const makeToken = require('../utils/makeToken');

class AuthService {
    static async login({ handle, password }) {
        let err = null, user = null;

        try {
            user = await User.findOne({ handle: handle }).exec();
        } catch (error) {
            err = error;
        }

        if (err)
            return Service.rejectResponse(err);
        if (!user)
            return Service.rejectResponse({ message: "Handle not found or incorrect password" });

        if (user.password === password)
                return Service.successResponse({ 
                ...user,
                token: makeToken({
                    handle: new_user.handle,
                    accountType: new_user.accountType,
                    admin: false
                }) 
            });
        else {
            return Service.rejectResponse({message: 'passwords did not match'})
        }
    }
}

module.exports = AuthService;