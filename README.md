# hello-api
A simple REST api built on nodejs with a mysql database, redis session store, and passport authentication

## Install the essentials

install nodejs [here](https://nodejs.org/en/download/package-manager/) if you already have it, cool, here's a cookie 🍪

install mysql [here](https://dev.mysql.com/downloads/)

# Getting started
Clone the repo `git clone https://github.com/deep7176/hello-api.git`

install the dependencies `npm install` 
then run `npm start` to start the server

# Sequelize

This framework makes it really easy for you to write queries and get data directly from the database... yea so no more SQL queries... 
you can check out the docs [here](http://docs.sequelizejs.com/en/latest/docs/getting-started/#your-first-query)

## Adding stuff??
Out of the box, this code will let you login, signup, and that's all, but you can add more features later
To add more functionality to the app, this is what you should do

1) Make the model
2) Make the route file and handle each request and response
3) Make the queries in the modules/data-manager.js file to get the data

For example, maybe you wanted a way to create, delete, update, and get a list of cars. Here's what you'd have to do...

### Make the model

Start by making a cars.js file and adding it to /models/ folder.
That model is used to map data to the database so it's important you get this right, if you need help modelling the objects, check out [this](http://docs.sequelizejs.com/en/v3/docs/models-definition/) page for more info. The model object you make is going to be used to make queries later on. You can also do joins and subqueries within the model file

in models/car.js
```javascript
"use strict";

module.exports = function (sequelize, DataTypes) {
    var Car = sequelize.define('Car', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        make: {
            type: DataTypes.STRING
        },
        model: {
            type: DataTypes.STRING
        },
        color: {
            type: DataTypes.STRING
        },
        licensePlate: {
            type: DataTypes.STRING
        },
        //id of the user that owns the car
        ownerId: {
            defaultValue: null,
            type: DataTypes.INTEGER
        }
    }, {
        classMethods: {
            associate: function (models) {

            }
        },
        // disable the modification of table names; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        //freezeTableName: true,

        // define the table's name
        tableName: 'Car'
    }, {
        dialect: 'mysql'
    });

    return Car;
};
```


### Make the route file and handle each request and response
- Then, make a corresponding file, cars.js in the /routes/ folder
This is where you handle network requests (it's also called the middlware), so if a user makes a GET request at the route /cars/ it should return a json array of car objects. 
Conversly, if they make a POST at the route /cars/ a new car object will be created in the data base with the information in the body of the request.

in routes/cars.js
```javascript
var express = require('express');
var router = express.Router();
var DM = require('../modules/data-manager');

/**
 * GET a list of cars that the current user has created
 * */
router.get('/', function (req, res, next) {
    var user = req.user;
    DM.getAllCars(user.id, function (cars) {
        res.status(200).send({status: 200, cars: cars});
    });
});

/**
 *  POST create a new car
 *
 * The request body should look like this...
 *
 * {
 *    "make": "Ferrari",
 *    "model": "F12",
 *    "color": "Red",
 *    "licensePlate": "FastAF"
 * }
 *
 *  */
router.post('/', function (req, res) {
    var user = req.user;

    var post = req.body;
    var newData = {
        make: post.make,
        model: post.model,
        color: post.color,
        licensePlate: post.licensePlate,
        ownerId: user.id
    };

    DM.createCar(user.id, newData, function (car, err) {
        if (car) {
            res.status(200).send({status: 200, message: "created!", car: car});
        } else {
            res.status(400).send({status: 400, message: "Error creating car", err: err});
        }
    })
});

/**
 * GET a car by id
 * anyone can access this
 * */
router.get('/:carId', function (req, res, next) {
    var carId = req.params.carId;

    if (!carId) {
        return res.status(400).send({status: 400, message: "No car id specified"});
    }

    DM.getCar(carId, function (car) {
        res.status(200).send({status: 200, car: car});
    });
});

/**
 * PUT update the information about the car
 *
 * in the request body include something like the following
 *
 * {
 *      "make": "Ferrari",
 *      "model": "FF",
 *      "color": "White",
 *      "licensePlate": "NiceAF"
 * }
 *
 * */
router.put('/:carId', function (req, res) {
    var user = req.user;
    var carId = req.params.carId;

    if (!carId) {
        return res.status(400).send({status: 400, message: "No car id specified"});
    }

    //the post made by the user
    var post = req.body;
    var newData = {id: carId};
    if (post.make) newData.make = post.make;
    if (post.model) newData.model = post.model;
    if (post.color) newData.color = post.color;
    if (post.licensePlate) newData.licensePlate = post.licensePlate;

    DM.updateCarInfo(user.id, newData, function (car, err) {
        console.log(err);
        if (car) {
            res.status(200).send({status: 200, message: "Updated!", car: car});
        } else {
            res.status(400).send({status: 400, message: err});
        }
    })
});

/**
 * DELETE delete a car
 * */
router.delete('/:carId', function (req, res) {
    var user = req.user;
    var carId = req.params.carId;

    if (!carId) {
        return res.status(400).send({status: 400, message: "No car id specified"});
    }

    DM.deleteCar(user.id, carId, function (deletedCar) {
        if (deletedCar) {
            res.status(200).send({status: 200, message: "Deleted car"});
        } else {
            res.status(400).send({status: 400, message: "Can't delete car"});
        }
    })
});


module.exports = router;
```

Import the route to the app.js file so it can process requests
```javascript
    ...
    
    //import route files here
    var auth = require('./routes/auth')(passport);
    var cars = require('./routes/cars');
    //set the routes
    app.use('/auth', auth); //routes that are exposed
    app.use('/cars', isLoggedIn, cars);
    
    ...
```

### Make the queries in the modules/data-manager.js file to get the data

make queries and update the methods in the data-manager file. That's a singular place where all queries to the database are made so that this way it's easier to debug.

```javascript
var models = require('../models');

/**
 * gets the list of cars associated with the user
 * */
exports.getAllCars = function (userId, callback) {
    models.Car.findAll({
        where: {
            ownerId: userId
        }
    }).then(function (cars) {
        callback(cars);
    });
};

/**
 * creates a new car and puts it in the database
 * */
exports.createCar = function (userId, newData, callback) {
    var car = {ownerId: userId};
    if (newData.make) car.make = newData.make;
    if (newData.model) car.model = newData.model;
    if (newData.color) car.color = newData.color;
    if (newData.licensePlate) car.licensePlate = newData.licensePlate;

    models.Car.create(car).then(function (car) {
        callback(car);
    });
};

/**
 * gets a car by id
 * */
exports.getCar = function (carId, callback) {
    models.Car.find({
        where: {
            id: carId
        }
    }).then(function (car) {
        callback(car);
    });
};

/**
 * updates the car info by id
 * */
exports.updateCarInfo = function (userId, newData, callback) {
    models.Car.find({
        where: {
            id: newData.id
        }
    }).then(function (car) {
        if (car) {
            if(car.ownerId != userId){
                return callback(null, "You don't own that car");
            }
            if (newData.make) car.make = newData.make;
            if (newData.model) car.model = newData.model;
            if (newData.color) car.color = newData.color;
            if (newData.licensePlate) car.licensePlate = newData.licensePlate;
            car.save().then((saved) => {
                callback(saved);
            })
        } else {
            callback(null, "Car not found");
        }
    });
};

/**
 * deletes a car object
 * */
exports.deleteCar = function (userId, carId, callback) {
    models.Car.find({
        where: {
            id: carId
        }
    }).then(function (car) {
        if (car) {
            //check if the user is the owner of the car otherwise they can't delete it
            if(car.ownerId != userId){
                return callback(null, "You don't own that car");
            }
            car.destroy().then(callback);
        } else {
            callback(null, "Car not found");
        }
    });
};

/**
 * gets the list of all users
 * */
exports.getAllUsers = function (callback) {
    models.User.findAll().then(function (users) {
        if (users) {
            callback(users);
        } else {
            callback(null);
        }
    });
};

```


## Testing
There is a really great doc about the best practices for building a REST api, you can check it out [here](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#restful)
if you want to test the api, you can use [Postman](https://www.getpostman.com/) to make requests to the endpoints









