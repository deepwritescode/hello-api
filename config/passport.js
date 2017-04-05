var models = require('../models');
//var bCrypt = require('bcrypt-nodejs');
var AM = require('../modules/account-manager');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        console.log('serializing user:', user.email);
        return done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log("deserializing user " + user.email);
        try {
            models.User.find({
                where: {id: user.id},
                attributes: ['id', 'first', 'last', 'email']
            }).then(function (user) {
                if (!user) {
                    return done("invalid session, please login again", null);
                }
                return done(null, user);
            }).error((err) => {
                return done("User does not exist", null);
            });
        } catch (err) {
            return done("Couldn't deserialize user... invalid session" + err, null);
        }
    });

    passport.use('login', new LocalStrategy({
        passReqToCallback: true
    }, function (req, username, password, done) {

        if (!username || !password) {
            return done(null, false, 'Missing Fields');
        }

        AM.manualLogin(username, password, (err, user) => {
            if (err) {
                return done(null, false, 'Invalid username or password.');
            } else {
                return done(null, user, 'Signed in succesfully!');
            }
        });
    }));

    passport.use('signup', new LocalStrategy({
        passReqToCallback: true
    }, function (req, username, password, done) {
        // Check if all the required fields are gotten
        username = req.body.username;
        password = req.body.password;
        var reqEmail = req.body.email;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;

        if (!username || !password || !reqEmail || !lastName || !firstName) {
            return done(null, false, 'Missing Fields');
        }

        AM.addNewAccount({
            username: username,
            password: password,
            first: firstName,
            last: lastName,
            email: reqEmail
        }, (err, user) => {
            if (err) {
                return done(null, false, err);
            } else {
                return done(null, user, 'Signup successful');
            }
        });

    }));

};
