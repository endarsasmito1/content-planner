const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const debugPassword = async () => {
    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { username: 'admin' } });
        const candidate = 'admin123';

        console.log('Stored Hash:', user.password);
        console.log('Candidate:', candidate);

        const manualCompare = await bcrypt.compare(candidate, user.password);
        console.log('Manual bcrypt comparison:', manualCompare);

        const methodCompare = await user.comparePassword(candidate);
        console.log('Model method comparison:', methodCompare);

        // Let's also try to hash it here and compare
        const start = Date.now();
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(candidate, salt);
        console.log('New Hash:', newHash);
        const compareNew = await bcrypt.compare(candidate, newHash);
        console.log('Compare New Hash:', compareNew);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

debugPassword();
