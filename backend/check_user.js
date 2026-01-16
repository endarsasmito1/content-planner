const sequelize = require('./config/database');
const User = require('./models/User');

const checkUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const user = await User.findOne({ where: { username: 'admin' } });
        if (user) {
            console.log('User found:', user.toJSON());
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
};

checkUser();
