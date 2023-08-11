const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken')

function makeToken({ handle, accountType, admin }) {
    return jsonwebtoken.sign({
        handle: handle,
        accountType: accountType,
        admin: admin,
    }, config.secrect, { expiresIn: '7d' });
}

module.exports = makeToken;