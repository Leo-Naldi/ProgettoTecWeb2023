/**
 * Contains the Authentication strategies. It is advised to use the middleware
 * from {@link module:middleware/auth} instead of the strategies directly.
 * @module auth/auth
 */

const passport = require('passport');
const passportJwt = require("passport-jwt");
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const AnonymousStrategy = require('passport-anonymous').Strategy;

const User = require('../models/User');
const config = require('../config/index');
const { logger } = require('../config/logging');

/**
 * Basic Authentication strategy for default users. Parses the token from the 
 * Authentication header with the bearer format.
 */
passport.use('basicAuth',
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
                user = await User.findOne({ handle: jwtPayload.handle }).populate('smm', 'handle _id');
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
                maxAge: "7d", 
            }
        },
        async function (jwtPayload, done) {

            let err = null, user = null;

            try {
                user = await User.findOne({ 
                    handle: jwtPayload.handle,
                    admin: true,
                }).populate('smm', 'handle _id');
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
                }).populate('smm', 'handle _id');
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