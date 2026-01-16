const sequelize = require('./config/database');
const User = require('./models/User');
const Team = require('./models/Team');
const SocialAccount = require('./models/SocialAccount');
const ContentPlan = require('./models/ContentPlan');
const bcrypt = require('bcryptjs');

// Define Associations (Must match server.js)
Team.hasMany(User);
User.belongsTo(Team);

User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);

User.hasMany(ContentPlan);
ContentPlan.belongsTo(User);

SocialAccount.hasMany(ContentPlan);
ContentPlan.belongsTo(SocialAccount);

const seedDatabase = async () => {
    try {
        // Sync database and force reset
        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: true });
        console.log('✅ Database cleaned and synced');

        // 1. Create Teams
        console.log('🌱 Seeding Teams...');
        const creativeTeam = await Team.create({
            name: 'Creative Team',
            description: 'Main content creation team'
        });

        const marketingTeam = await Team.create({
            name: 'Marketing Team',
            description: 'Distribution and analytics'
        });

        // 2. Create Users
        console.log('🌱 Seeding Users...');

        // Admin
        const admin = await User.create({
            username: 'admin',
            email: 'admin@content.com',
            name: 'Admin User',
            password: 'admin123', // Will be hashed by hook
            role: 'superadmin',
            TeamId: creativeTeam.id
        });

        // Content Creator
        const creator = await User.create({
            username: 'creator',
            email: 'creator@content.com',
            name: 'John Creator',
            password: 'password123',
            role: 'user',
            TeamId: creativeTeam.id
        });

        // 3. Create Social Accounts
        console.log('🌱 Seeding Social Accounts...');
        const instagram = await SocialAccount.create({
            platform: 'Instagram',
            username: 'content_planner',
            link: 'https://instagram.com/content_planner',
            UserId: admin.id
        });

        const tiktok = await SocialAccount.create({
            platform: 'TikTok',
            username: 'creative_daily',
            link: 'https://tiktok.com/@creative_daily',
            UserId: creator.id
        });

        // 4. Create Content Plans
        console.log('🌱 Seeding Content Plans...');

        await ContentPlan.bulkCreate([
            {
                title: 'New Feature Launch',
                caption: 'Excited to announce our new planning features! #productivity',
                postingDate: new Date(Date.now() + 86400000), // Tomorrow
                status: 'draft',
                views: 0,
                UserId: admin.id,
                SocialAccountId: instagram.id
            },
            {
                title: 'Team BTS',
                caption: 'Behind the scenes at the office today.',
                postingDate: new Date(),
                status: 'posted',
                link: 'https://tiktok.com/@creative_daily/video/123456',
                resourceLink: 'https://drive.google.com/drive/folders/bfs_assets',
                views: 1250,
                likes: 120,
                comments: 15,
                UserId: creator.id,
                SocialAccountId: tiktok.id
            },
            {
                title: 'Q3 Goals Review',
                caption: 'Lets look back at what we achieved.',
                postingDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
                status: 'posted',
                views: 3400,
                likes: 450,
                comments: 32,
                UserId: admin.id,
                SocialAccountId: instagram.id
            },
            {
                title: 'Design Tips #1',
                caption: 'Color theory basics for beginners.',
                postingDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
                status: 'draft',
                UserId: creator.id,
                SocialAccountId: instagram.id
            }
        ]);

        console.log('✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();
