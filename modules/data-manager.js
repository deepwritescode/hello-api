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
