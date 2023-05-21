const User = require('../models/User');
const Service = require('./Service');
const makeToken = require('../utils/makeToken');

class AuthService {
    static async login({ handle, password }) {
        let err = null, user = null;

        try {
            user = await User.findOne({ handle: handle });
        } catch (error) {
            err = error;
        }

        if (err)
            return Service.rejectResponse(err);
        if (!user)
            return Service.rejectResponse({ message: "Handle not found or incorrect password" });

        if (user.password === password) {
            user.lastLoggedin = new Date();

            user = await user.save();
            return Service.successResponse({ 
                user: user.toObject(),
                token: makeToken({
                    handle: user.handle,
                    accountType: user.accountType,
                    admin: user.admin
                }) 
            });
        } else {
            return Service.rejectResponse({message: 'passwords did not match'})
        }
    }

    static async loginPro({ handle, password }) {
        let err = null, user = null;

        try {
            user = await User.findOne({ handle: handle, accountType: 'pro' });
        } catch (error) {
            err = error;
        }

        if (err)
            return Service.rejectResponse(err);
        if (!user)
            return Service.rejectResponse({ message: "Handle not found or incorrect password" });

        if (user.password === password) {
            user.lastLoggedin = new Date();

            user = await user.save();
            return Service.successResponse({
                user: user.toObject(),
                token: makeToken({
                    handle: user.handle,
                    accountType: user.accountType,
                    admin: user.admin
                })
            });
        } else {
            return Service.rejectResponse({ message: 'passwords did not match' })
        }
    }

    static async loginAdmin({ handle, password }) {
        let err = null, user = null;

        try {
            user = await User.findOne({ handle: handle, admin: true });
        } catch (error) {
            err = error;
        }

        if (err)
            return Service.rejectResponse(err);
        if (!user)
            return Service.rejectResponse({ message: "Handle not found or incorrect password" });

        if (user.password === password) {
            user.lastLoggedin = new Date();

            user = await user.save();
            return Service.successResponse({
                user: user.toObject(),
                token: makeToken({
                    handle: user.handle,
                    accountType: user.accountType,
                    admin: user.admin
                })
            });
        } else {
            return Service.rejectResponse({ message: 'passwords did not match' })
        }
    }
}

module.exports = AuthService;