const User = require('../models/User');
const Service = require('./Service');
const makeToken = require('../utils/makeToken');
const { logger } = require('../config/logging');

class AuthServices {

    static async #generalLogIn({ handle, password, pro=null, admin=null }) {
        let user = null;

        if (!((handle) && (password)))
            return Service.rejectResponse({ message: "Must Provide both a handle and a password" })

        
        let filter = { handle: handle };

        if (pro) filter.accountType = 'pro';
        if (admin) filter.admin = admin;

        user = await User.findOne(filter).select('-__v').populate('joinedChannels', 'name');


        if (!user)
            return Service.rejectResponse({ message: "Handle not found" });

        if (user.password === password) {
            user.lastLoggedin = new Date();

            let managed = await User.find({ smm: user._id });

            user = await user.save();

            let ures = { ...user.toObject(), managed: managed.map(u => u.handle) };

            delete ures.password;
            ures.joinedChannels = ures.joinedChannels.map(c => c.name);

            return Service.successResponse({
                user: ures,
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

    static async login({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password })
    }

    static async loginPro({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password, pro: true });
    }

    static async loginAdmin({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password, admin: true });
    }

    static async refreshToken({ reqUser }) {
        
        if (!reqUser) return Service.rejectResponse({ message: 'Must provide a valid token' })
        
        
        return Service.successResponse({ 
                token: makeToken({
                    handle: reqUser.handle,
                    accountType: reqUser.accountType,
                    admin: reqUser.admin
                })
            });

    }
}

module.exports = AuthServices;