const User = require('../models/User');
const Service = require('./Service');
const makeToken = require('../utils/makeToken');

class AuthServices {
    static async login({ handle, password }) {
        let user = null;

        if (!((handle) && (password))) 
            return Service.rejectResponse({ message: "Must Provide both a handle and a password" })

        user = await User.findOne({ handle: handle }).select('-__v');
        

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
        let user = null;

        if (!((handle) && (password)))
            return Service.rejectResponse({ message: "Must Provide both a handle and a password" })

        user = await User.findOne({ handle: handle, accountType: 'pro' }).select('-__v');

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
        let user = null;

        if (!((handle) && (password)))
            return Service.rejectResponse({ message: "Must Provide both a handle and a password" })

        user = await User.findOne({ handle: handle, admin: true }).select('-__v');

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

module.exports = AuthServices;