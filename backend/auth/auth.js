const passport = require('passport');
const passportJwt = require("passport-jwt");
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const mongoose = require('mongoose');
const AnonymousStrategy = require('passport-anonymous').Strategy;

const User = require('../models/User');
const config = require('../config/index');


passport.use( 'basicAuth',
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secrect,
            jsonWebTokenOptions: {
                maxAge: "1d",  // TODO
            }
        },
        async function (jwtPayload, done) {
            
            let err = null, user = null;
            
            try {
                user = await User.findOne({ handle: jwtPayload.handle });
            } catch (error) {
                err = error;
            }
            
                
            if (err) 
                return done(err);
            if (!user) 
                return done(null, false);
            
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
                maxAge: "1d",  // TODO
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
            }


            if (err)
                return done(err);
            if (!user)
                return done(null, false);
            
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
                maxAge: "1d",  // TODO
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
            }


            if (err)
                return done(err);
            if (!user)
                return done(null, false);

            return done(null, user);
        }
    )
);

passport.use(new AnonymousStrategy())