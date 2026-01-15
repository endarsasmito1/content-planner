const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialAccount = sequelize.define('SocialAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = SocialAccount;
