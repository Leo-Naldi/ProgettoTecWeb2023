const passport = require('passport');
const passportJwt = require("passport-jwt");
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const mongoose = require('mongoose');
const AnonymousStrategy = require('passport-anonymous').Strategy;

const User = require('../models/User');
const config = require('../config/index');
const { logger } = require('../config/logging');


passport.use( 'basicAuth',
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secrect,
            jsonWebTokenOptions: {
                maxAge: "7d",  // TODO
            }
        },
        async function (jwtPayload, done) {
            
            let err = null, user = null;
            
            try {
                user = await User.findOne({ handle: jwtPayload.handle });
            } catch (error) {
                err = error;
                logger.error(`basicAuth Error: ${err.message || err}`)
            }
                
            if (err) 
                return done(err);
            if (!user) {
                logger.info(`basicAuth: no user named [${jwtPayload.handle}]`)
                return done(null, false);
            }
            
            user.lastLoggedin = new Date();

            return done(null, await user.save());
        }
    )
);

passport.use('adminAuth',
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secrect,
            jsonWebTokenOptions: {
                maxAge: "7d",  // TODO
            }
        },
        async function (jwtPayload, done) {

            let err = null, user = null;

            try {
                user = await User.findOne({ 
                    handle: jwtPayload.handle,
                    admin: true,
                });
            } catch (error) {
                err = error;
                logger.error(`adminAuth Error: ${err.message || err}`)
            }

            if (err)
                return done(err);
            if (!user) {
                logger.info(`adminAuth: no admin user named [${jwtPayload.handle}]`)
                return done(null, false);
            }

            user.lastLoggedin = new Date();

            return done(null, await user.save());
        }
    )
);

passport.use('proAuth',
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secrect,
            jsonWebTokenOptions: {
                maxAge: "7d", 
            }
        },
        async function (jwtPayload, done) {

            let err = null, user = null;

            try {
                user = await User.findOne({
                    handle: jwtPayload.handle,
                    accountType: 'pro',
                });
            } catch (error) {
                err = error;
                logger.error(`proAuth Error: ${err.message || err}`)
            }

            if (err)
                return done(err);
            if (!user) {
                logger.info(`proAuth: no pro user named [${jwtPayload.handle}]`)
                return done(null, false);
            }

            user.lastLoggedin = new Date();

            return done(null, await user.save());
        }
    )
);

passport.use(new AnonymousStrategy());

// Use this instead of the passport.authenticate middleware
function getAuthStrat(name) {
    return (req, res, next) => {
        passport.authenticate(name, function (err, user, info) {
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

module.exports = getAuthStrat;