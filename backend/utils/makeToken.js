/**
 * Token creation utility module
 * @module util/makeToken
 */

const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken')

/**
 * Makes and signs the user's jwt token with a 7 day expiration window.
 * 
 * @param {Object} account - The authorized user's authentication data
 * @param {string} account.handle - The authorized user's handle 
 * @param {('user'|'pro'|'admin')} account.accountType - The authorized user's account type
 * @param {boolean} account.admin - The authorized user's admin status
 * @returns The signed token
 */
function makeToken({ handle, accountType, admin }) {
    return jsonwebtoken.sign({
        handle: handle,
        accountType: accountType,
        admin: admin,
    }, config.secrect, { expiresIn: '7d' });
}

module.exports = makeToken;