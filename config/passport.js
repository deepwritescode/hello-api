var AM = require('../modules/account-manager');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/jwt');

module.exports = function (passport) {

    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader({failmessage: 'missing token'});
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        console.log(jwt_payload);
        AM.getProfile(jwt_payload.id, (err, user) => {
            if (user) {
                return done(null, user, "success");
            } else {
                return done(err, false, "Can't find that user");
            }
        });
    }));

};
