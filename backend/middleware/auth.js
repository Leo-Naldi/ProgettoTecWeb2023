/**
 * Authentication middleware module
 * @module middleware/auth
 */


const Channel = require('../models/Channel');
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


/**
 * Middleware that checks weather the requesting user is the creator of the 
 * /:name/ channel.
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
async function checkNameCreator(req, res, next) {
    const channel = await Channel.findOne({ name: req.params.name });

    if (!channel) return res.status(409).json({ message: `No channel named ${req.params.name}` })

    if (!req.user?._id.equals(channel.creator))
        return res.status(401).json({ message: 'Only the creator can modify the channel' });
    
    next();
}

/**
 * Middleware for the edit channel endpoint. Checks that either the requesting 
 * user is /:name/'s creator or that /:name/ is an official channel and requesting
 * user is an admin.
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
async function checkNameCreatorOrAdmin(req, res, next) {
    const channel = await Channel.findOne({ name: req.params.name });

    if (!channel) return res.status(409).json({ message: `No channel named ${req.params.name}1` })

    if (!(req.user?._id.equals(channel.creator) || ((req.user.admin) && (channel.official))))
        return res.status(401).json({ message: 'Only the creator can modify the channel' });

    next();
}

/**
 * Checks weather requesting user is /:handle or an admin.
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
async function checkOwnUserOrAdmin(req, res, next) {
    
    if (!((req.params.handle === req.user.handle) || (req.user.admin))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
}

/**
 * Checks weather requesting user is a /:name channel member.
 * 
 * @param {Express.Request} req The request object
 * @param {Express.Response} res The response object
 * @param {Express.NextFunction} next The next middleware
 */
async function checkNameMember(req, res, next) {
    let channel = await Channel.findOne({ name: req.params.name });

    if (!channel) 
        return res.status(409).json({ message: `No channel named §${req.params.name}` });

    if (!req.user.joinedChannels.find(cid => channel._id.equals(cid))) 
        return res.status(401).json({ message: `Not a member of §${req.params.name}` });

    req.channel = channel;
    next();
}

module.exports = {
    getAuthMiddleware, 
    checkOwnUser,
    checkOwnUserOrSMM,
    checkNameCreator,
    checkNameCreatorOrAdmin,
    checkOwnUserOrAdmin,
    checkNameMember
};