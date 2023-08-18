/**
 * Authentication Services Module.
 * 
 * Implements the login operations for all users as static functions
 * 
 * @module services/AuthServices
 */

const User = require('../models/User');
const Service = require('./Service');
const makeToken = require('../utils/makeToken');
const { logger } = require('../config/logging');


class AuthServices {

    /**
     * Main authentication function, thakes the user record from the database and compares
     * the passwords.
     * 
     * @param {Object} user - The requesting user's relevant data
     * @param {string} user.handle - The requesting user's handle
     * @param {string} user.password - The given password
     * @param {bool} user.pro - If the user is a pro user
     * @param {bool} user.admin - If the user is an admin
     * @returns The user recond and the token if authentication is successful, an error message if not
     */
    static async #generalLogIn({ handle, password, pro=false, admin=false }) {
        let user = null;

        if (!((handle) && (password))) {
            logger.error(`#generalLogIn: missing handle or password`);
            return Service.rejectResponse({ message: "Must Provide both a handle and a password" })
        }

        
        let filter = { handle: handle };

        if (pro) filter.accountType = 'pro';
        if (admin) filter.admin = admin;

        user = await User.findOne(filter).select('-__v').populate('joinedChannels', 'name');


        if (!user) {
            logger.debug(`#generalLogIn: user @${handle} of type ${((admin) ? 'admin': (pro ? 'pro': 'user'))} not found`)
            return Service.rejectResponse({ message: "Handle not found" });
        }

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
            logger.debug(`#generalLogIn: passwords did not match, the recieved password was [${password}]`)
            return Service.rejectResponse({ message: 'passwords did not match' })
        }
    }

    /**
     * Login service for non-pro/admin users.
     * 
     * @param {Object} user - The requesting user's relevant data
     * @param {string} user.handle - The requesting user's handle
     * @param {string} user.password - The given password
     * @returns The user recond and the token if authentication is successful, an error message if not
     */
    static async login({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password })
    }

    /**
     * Login service for pro users.
     * 
     * @param {Object} user - The requesting user's relevant data
     * @param {string} user.handle - The requesting user's handle
     * @param {string} user.password - The given password
     * @returns The user recond and the token if authentication is successful, an error message if not
     */
    static async loginPro({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password, pro: true });
    }

    /**
     * Login service for admin users.
     * 
     * @param {Object} user - The requesting user's relevant data
     * @param {string} user.handle - The requesting user's handle
     * @param {string} user.password - The given password
     * @returns The user recond and the token if authentication is successful, an error message if not
     */
    static async loginAdmin({ handle, password }) {
        return AuthServices.#generalLogIn({ handle, password, admin: true });
    }

    /**
     * Token refresh service, takes the authenticated user and 
     * returns a new token (including a new expiration date). 
     * 
     * You still need a valid token to access this service, meaning that the token
     * can only be refeshed before expiration.
     * 
     * @param {Object} param - Service Parameters
     * @param {Object} param.reqUser - The authenticated user
     * @param {Object} param.reqUser.handle - The authenticated user's handle
     * @param {('user'|'pro'|'admin')} param.reqUser.accountType - The authenticated user's account type
     * @param {boolean} param.reqUser.admin - The authenticated user's admin status
     * @returns A new token created with {@link module:utils/makeToken}
     */
    static async refreshToken({ reqUser }) {
        
        if (!reqUser) {
            logger.error(`refreshToken service called with no valid user`);
            return Service.rejectResponse({ message: 'Must provide a valid token' });
        }
        
        
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