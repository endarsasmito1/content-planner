
const sequelize = require('./config/database');
const SocialAccount = require('./models/SocialAccount');
const ContentPlan = require('./models/ContentPlan');
const User = require('./models/User');

// Setup associations like server.js
SocialAccount.hasMany(ContentPlan);
ContentPlan.belongsTo(SocialAccount);
User.hasMany(ContentPlan);
ContentPlan.belongsTo(User);


async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');

        const plans = await ContentPlan.findAll({
            include: [
                { model: SocialAccount, attributes: ['id', 'platform', 'username'] }
            ]
        });

        console.log('Plans with relation:', JSON.stringify(plans, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
