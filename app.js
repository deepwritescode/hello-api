var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
require('./config/passport')(passport);

var app = express();

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
    passport.authenticate('jwt', {session: false}, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized",
                err: info
            });
        }
        req.user = user;   // Forward user information to the next middleware
        next();
    })(req, res, next);
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
    res.header('Cache-Control', 'no-store, no-cache');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

//import route files here
var auth = require('./routes/auth');
var cars = require('./routes/cars');
//set the routes
app.use('/auth', auth); //routes that are exposed
app.use('/cars', isLoggedIn, cars);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.status(404).send({status: 404, message: "Route not found!"});
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(500).send({success: false, message: "Server Error!", err: err});
    console.log(err);
});

module.exports = app;
