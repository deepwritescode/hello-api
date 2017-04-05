/**
 * Created by deep on 10/10/16.
 * data model class for a user
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW
        }
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Car, {
                    foreignKey: 'ownerId'
                    //automatically makes a join on the ownerId in this model with
                    //id in the user table
                });
            }
        },
        // add the timestamp attributes (updatedAt, createdAt)
        timestamps: true,

        // disable the modification of table names; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        //freezeTableName: true,

        // define the table's name
        tableName: 'User'
    }, {
        dialect: 'mysql'
    });

    return User;
};
