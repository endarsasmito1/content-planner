const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('superadmin', 'user'),
        defaultValue: 'user'
    },
    avatarUrl: {
        type: DataTypes.STRING,
        defaultValue: 'https://i.pravatar.cc/150?u=default'
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activeUntil: {
        type: DataTypes.DATE, // Expiry date for login access
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'dateJoined',
    updatedAt: 'updatedAt',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to check password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Class method to find user by credentials
User.findByCredentials = async function (username, password) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    return user;
};

module.exports = User;
