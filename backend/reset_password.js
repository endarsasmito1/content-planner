const sequelize = require('./config/database');
const User = require('./models/User');

const resetAdminPassword = async () => {
    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { username: 'admin' } });
        if (user) {
            console.log('Resetting password for admin...');
            // Triggers beforeUpdate hook which hashes the password
            user.password = 'admin123';
            await user.save();
            console.log('Password updated successfully.');
        } else {
            console.log('User admin not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

resetAdminPassword();
