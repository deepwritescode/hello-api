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