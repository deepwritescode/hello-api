var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const validator = require('../modules/validator');
var AM = require('../modules/account-manager');
const passport = require('passport');
require('../config/passport')(passport);


/**
 * Use this route to check if the user is logged in
 * */
router.get('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    return res.send({user: req.user});
});

/**
 * request that handles the login of the user
 *
 * in the post body include the following
 * username: {user's username}
 * password: {user's password}
 * */
router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        return res.send({success: false, message: "Please include a username and password"});
    }

    AM.manualLogin(req.body.username, req.body.password, (err, user) => {
        if (err) {
            var errorMessage = 'Invalid password, if you forgot your password you can reset it by clicking the forgot link.';
            if (err == 'user-not-found') {
                errorMessage = 'User not found, please signup for an account if you would like to use the system';
            }
            return res.send({success: false, message: errorMessage});
        } else {
            const token = jwt.sign({
                id: user.id
            }, config.secret, {expiresIn: config.expiresIn});
            user.password = undefined;
            user.emailVerificationCode = undefined;
            return res.send({
                success: true,
                message: "success",
                token: "JWT " + token,
                user: user
            });
        }
    });
});

/**
 * request that handles the signup of the user
 *
 * in the post body include the following
 *
 * firstName: {user's first name}
 * lastName: {user's last name}
 * email: {user's email}
 * username: {user's username}
 * password: {user's password}
 * */
router.post('/signup', function (req, res, next) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var reqEmail = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var reqPhone = req.body.phone;

    if (!username || !password || !reqPhone || !reqEmail || !lastName || !firstName) {
        return res.send({
            success: false,
            message: 'Please include username, password, email, phone, firstName and lastName'
        });
    }
    if (!validator.validEmail(reqEmail)) {
        return res.send({
            success: false,
            message: 'Invalid email, please enter a valid email and try again'
        });
    }
    if (!validator.validPhone(reqPhone)) {
        return res.send({
            success: false,
            message: 'Invalid phone number, please enter a valid 10 digit phone number and try again'
        });
    }
    if (!validator.validUsername(username)) {
        return res.send({
            success: false,
            message: 'Username must be letters numbers and may contain dashes and underscores.'
        });
    }
    if (!validator.validPassword(password)) {
        return res.send({
            success: false,
            message: 'The password must be 8 characters long with a number, letter, and one unique character (ex. !#$%&? ")'
        });
    }

    AM.addNewAccount({
        username: username,
        password: password,
        first: firstName,
        last: lastName,
        email: reqEmail,
        phone: reqPhone
    }, (err, user) => {
        if (err) {
            return res.send({success: false, message: err.toString()});
        } else {
            user.password = undefined;
            user.emailVerificationCode = undefined;
            const token = jwt.sign({
                id: user.id,
                first: user.first,
                username: user.username
            }, config.secret, {expiresIn: config.expiresIn});
            return res.send({
                success: true,
                message: "success",
                user: user,
                token: "JWT " + token
            });
        }
    });
});

module.exports = router;
