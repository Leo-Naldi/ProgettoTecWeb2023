/**
 * Authentication middleware module
 * @module middleware/auth
 */

const passport = require('passport');
require('../auth/auth');


/**
 * Authention middleware factory using the strategies defined in {@link module:auth/auth}.
 * If the authentication results in an error it will be forwarded to the next middleware,
 * if it fails the middleware will send a 401 response with a json body, otherwise the 
 * authenticated user will be added in req.user and the next middleware will be called.
 * 
 * @param {string} name The name of the authentication strategy (see {@link module:auth/auth})
 * @returns {function} An express middleware function that applies the strategy
 */
function getAuthMiddleware(name) {
    return (req, res, next) => {
        passport.authenticate(name, { session: false }, function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = user
            next()
        })(req, res, next);
    }
}

module.exports = getAuthMiddleware;