const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentPlan = sequelize.define('ContentPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    postingDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        allowNull: false
    },
    // Foreign Keys defined in associations: SocialAccountId, UserId
});

module.exports = ContentPlan;
