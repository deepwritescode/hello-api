var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var redis = require('redis');
var session = require('express-session');
var passport = require('passport');
require('./config/passport')(passport);

var app = express();

var rds = redis.createClient({port: 6379, host: 'localhost', db: 1});
app.use(bodyParser.json());
app.use(cookieParser('random-key'));
app.use(cookieSession({secret: "random-key"}));
var sessionMiddleware = session({
    store: rds, // XXX redis server config
    secret: "random-key",
    resave: true,
    saveUninitialized: false
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
    //console.log(req)
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).send({status: 401, message: "You must be logged in."})
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
var auth = require('./routes/auth')(passport);
var cars = require('./routes/cars');
//set the routes
app.use('/auth', auth); //routes that are exposed
app.use('/cars', isLoggedIn, cars);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).send({status: 404, message: "Route not found!"});
    //next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if(err == "invalid session, please login again") {
        req.logOut()
    }
    res.status(500).send({status: 500, message: "Server Error!", err: err });
    console.log(err);
});

module.exports = app;
