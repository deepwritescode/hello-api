/**
 * Created by deep on 4/5/17.
 */
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