/**
 * Authentication middleware module
 * @module middleware/auth
 */


const User = require('../models/User');
const passport = require('passport');
require('../auth/auth');


/**
 * Authention middleware factory using the strategies defined in {@link module:auth/auth}.
 * If the authentication results in an error it will be forwarded to the next middleware,
 * if it fails the middleware will send a 401 response with a json body, otherwise the 
 * authenticated user will be added in req.user and the next middleware will be called.
 * 
 * @param {'basicAuth'|'proAuth'|'adminAuth'} name The name of the authentication strategy (see {@link module:auth/auth})
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

/**
 * Middleware that checks weather the /:handle/ route parameter matches with the one 
 * in the jwt.
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
function checkOwnUser(req, res, next) {
    if (req.params.handle !== req.user.handle) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next()
}

/**
 * Middleware that checks weather the /:handle/ route parameter matches with the one 
 * in the jwt or if the user making the request is /:handle/'s smm. In the latter case
 * req.user is set to the /:handle/ user and the actual requesting user is put into
 * req.smm  
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
async function checkOwnUserOrSMM(req, res, next) {

    if (req.params.handle !== req.user.handle) {
        
        const user = await User.findOne({ handle: req.params.handle });
        
        if (!(user && req.user._id.equals(user?.smm))) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.smm = req.user;
        req.user = user;
    }

    next();
}

module.exports = {
    getAuthMiddleware, 
    checkOwnUser,
    checkOwnUserOrSMM,
};