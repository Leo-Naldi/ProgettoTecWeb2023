const passport = require('passport');
const passportJwt = require("passport-jwt");
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const mongoose = require('mongoose');

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
                user = await User.findOne({ handle: jwtPayload.handle }).exec();
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