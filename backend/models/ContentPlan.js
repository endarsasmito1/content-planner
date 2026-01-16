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
    script: {
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
    resourceLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        allowNull: false
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
    // Foreign Keys defined in associations: SocialAccountId, UserId
});

module.exports = ContentPlan;
