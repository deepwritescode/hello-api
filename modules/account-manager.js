var encrypt = require('./encrypt');
var models = require('../models');

'use strict';

/* login validation methods */

exports.autoLogin = function (username, pass, callback) {
    console.log('DEBUG: account-manager: auto login');
    //debug('account-manager: auto login');
    models.User.find({where: {username: username}}).then(function (user) {
        if (user) {
            user.password == pass ? callback(user) : callback(null);
        } else {
            return callback(null);
        }
    });
};

exports.manualLogin = function (username, pass, callback) {
    console.log('DEBUG: account-manager: manual login');
    models.User.find({where: {username: username}}).then(function (user) {
        if (user == null) {
            return callback('user-not-found');
        } else {
            encrypt.validatePassword(pass, user.password, function (err, res) {
                if (res) {
                    user.password = undefined;
                    return callback(null, user);
                } else {
                    return callback('invalid-password');
                }
            });
        }
    });
};

exports.addNewAccount = function (newData, callback) {
    //find a user that has an email or username that is equal to the attempted signup
    models.User.find({
            where: {
                $or: [
                    {username: newData.username},
                    {email: newData.email}
                ]
            }
        }
    ).then(function (user) {
        if (user) {
            if (user.username.toLocaleLowerCase() == newData.username.toLocaleLowerCase()) {
                return callback("That username is already in use");
            } else if (user.email.toLocaleLowerCase() == newData.email.toLocaleLowerCase()) {
                return callback("That email is already in use");
            }

        } else {
            encrypt.saltAndHash(newData.password, function (hash) {
                newData.password = hash;

                models.User.create({
                    username: newData.username,
                    password: newData.password,
                    first: newData.first,
                    last: newData.last,
                    email: newData.email
                }).then((user) => {
                    return callback(null, user);
                });

            });
        }
    });
};

exports.getProfile = function (id, callback) {
    models.User.find({
        where: {id: id},
        attributes: ['id', 'first', 'last', 'email', 'createdAt', 'updatedAt']
    }).then(function (user) {
        if (!user) {
            return callback("Couldn't get user", null);
        }
        return callback(null, user);
    }).error((err) => {
        return callback("User does not exist", null);
    });
};

exports.updateAccount = function (newData, callback) {
    models.User.find({
        where: {
            id: newData.id
        }
    }).then(function (user) {
        if (newData.first) user.first = newData.first;
        if (newData.last) user.last = newData.last;

        if (newData.email) {
            models.User.find({where: {email: newData.email}}).then(function (userWithEmail) {
                if (userWithEmail) {
                    //there's already a user with that email... send an error
                    return callback('email-taken', null);
                } else {
                    //there isn't a user with that email, update the email
                    user.email = newData.email;
                    user.save().then(function (updatedUser) {
                        if (updatedUser) {
                            return callback(null, updatedUser)
                        } else {
                            return callback('error-updating-user', null);
                        }
                    });
                }
            });
        } else {
            user.save().then(function (updatedUser) {
                if (updatedUser) {
                    return callback(null, updatedUser)
                } else {
                    return callback('error-updating-user', null);
                }
            });
        }

    });
};

exports.updatePassword = function (email, newPass, callback) {
    models.User.find({where: {email: email}}).then(function (user) {

        encrypt.saltAndHash(newPass, function (pass) {
            user.update({password: pass}).then(callback)
        });

    });
};

/* account lookup methods */

exports.deleteAccount = function (id, callback) {

};

exports.getAccountByEmail = function (email, callback) {

};

exports.validateResetLink = function (email, passHash, callback) {
    models.User.find({where: {email: email, password: passHash}}).then(function (user) {
        return callback(user ? 'ok' : null);
    });
};

exports.getAllRecords = function (callback) {
    models.User.findAll().then(function (users) {
        return callback(null, users)
    });
};

exports.delAllRecords = function (callback) {
    //accounts.remove({}, callback); // reset accounts collection for testing //
    return callback('Nahh I\'m not doing that go fuck yourself...');
};
