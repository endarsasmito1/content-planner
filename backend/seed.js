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

        // 2. Create Users
        console.log('🌱 Seeding Users...');
        // Admin
        const admin = await User.create({
            username: 'admin',
            email: 'admin@content.com',
            name: 'Admin User',
            password: 'admin123',
            role: 'superadmin',
            TeamId: creativeTeam.id
        });

        // 3. Create Social Accounts (One for each platform)
        console.log('🌱 Seeding Social Accounts...');
        const accounts = await Promise.all([
            SocialAccount.create({ platform: 'Instagram', username: 'content_planner_ig', link: 'https://instagram.com/content_planner', UserId: admin.id }),
            SocialAccount.create({ platform: 'Facebook', username: 'Content Planner FB', link: 'https://facebook.com/contentplanner', UserId: admin.id }),
            SocialAccount.create({ platform: 'YouTube', username: 'Content Planner TV', link: 'https://youtube.com/contentplanner', UserId: admin.id }),
            SocialAccount.create({ platform: 'Twitter', username: 'content_twit', link: 'https://twitter.com/content_planner', UserId: admin.id }),
            SocialAccount.create({ platform: 'TikTok', username: 'creative_daily_tt', link: 'https://tiktok.com/@creative_daily', UserId: admin.id })
        ]);

        const [ig, fb, yt, tw, tt] = accounts;

        // 4. Create Content Plans
        console.log('🌱 Seeding Content Plans...');
        const plans = [
            // Instagram
            { title: 'New Feature Teaser', caption: 'Something big is coming... #staytuned', postingDate: new Date(Date.now() + 86400000 * 7), status: 'draft', UserId: admin.id, SocialAccountId: ig.id },
            { title: 'Office Tour', caption: 'Where the magic happens. #officelife', postingDate: new Date(Date.now() + 86400000 * 12), status: 'draft', UserId: admin.id, SocialAccountId: ig.id },
            { title: 'CEO Interview', caption: 'Vision for 2026.', postingDate: new Date(Date.now() + 86400000 * 8), status: 'scripting', UserId: admin.id, SocialAccountId: ig.id },
            { title: 'Team Sizzle Reel', caption: 'Meet the squad.', postingDate: new Date(Date.now() - 86400000 * 5), status: 'posted', link: 'https://instagram.com/p/12345', UserId: admin.id, SocialAccountId: ig.id },

            // Facebook
            { title: 'Community Update', caption: 'Join our group!', postingDate: new Date(Date.now() + 86400000 * 3), status: 'ready', UserId: admin.id, SocialAccountId: fb.id },
            { title: 'Product Launch Event', caption: 'Live this Sunday.', postingDate: new Date(Date.now() + 86400000 * 10), status: 'planning', UserId: admin.id, SocialAccountId: fb.id },
            { title: 'Blog Post Share', caption: 'Read about our journey.', postingDate: new Date(Date.now() - 86400000 * 2), status: 'posted', link: 'https://facebook.com/post/1', UserId: admin.id, SocialAccountId: fb.id },

            // YouTube
            { title: 'Full Tutorial 2026', caption: 'Master the basics.', postingDate: new Date(Date.now() + 86400000 * 15), status: 'scripting', UserId: admin.id, SocialAccountId: yt.id },
            { title: 'Vlog: Day 1', caption: 'Starting fresh.', postingDate: new Date(Date.now() + 86400000 * 2), status: 'shooting', UserId: admin.id, SocialAccountId: yt.id },
            { title: 'Tech Review', caption: 'Best mics for podcasting.', postingDate: new Date(Date.now() + 86400000 * 20), status: 'draft', UserId: admin.id, SocialAccountId: yt.id },

            // Twitter
            { title: 'Quick Tip #1', caption: 'Use shortcuts.', postingDate: new Date(Date.now() + 86400000), status: 'ready', UserId: admin.id, SocialAccountId: tw.id },
            { title: 'Thread: Marketing 101', caption: 'A thread 🧵', postingDate: new Date(Date.now() + 86400000 * 5), status: 'draft', UserId: admin.id, SocialAccountId: tw.id },
            { title: 'Poll: Feature Request', caption: 'Vote now!', postingDate: new Date(Date.now() - 86400000), status: 'posted', link: 'https://twitter.com/status/1', UserId: admin.id, SocialAccountId: tw.id },

            // TikTok
            { title: 'Viral Challenge', caption: 'We tried it.', postingDate: new Date(Date.now() + 86400000 * 4), status: 'shooting', UserId: admin.id, SocialAccountId: tt.id },
            { title: 'Behind The Scenes', caption: 'How we edit.', postingDate: new Date(Date.now() + 86400000 * 6), status: 'editing', UserId: admin.id, SocialAccountId: tt.id },
            { title: 'Funny Skit', caption: 'POV: Developer life.', postingDate: new Date(Date.now() + 86400000 * 9), status: 'scripting', UserId: admin.id, SocialAccountId: tt.id },
            { title: 'App Showcase', caption: 'Check this out.', postingDate: new Date(Date.now() - 86400000 * 10), status: 'posted', link: 'https://tiktok.com/video/1', UserId: admin.id, SocialAccountId: tt.id }
        ];

        // Additional random filler
        for (let i = 0; i < 15; i++) {
            const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];
            const statusList = ['draft', 'scripting', 'shooting', 'editing', 'ready', 'posted'];
            const randomStatus = statusList[Math.floor(Math.random() * statusList.length)];
            const dateOffset = Math.floor(Math.random() * 30) - 10; // -10 to +20 days

            plans.push({
                title: `Auto Gen Task ${i + 1}`,
                caption: `Generated content for ${randomAcc.platform}`,
                postingDate: new Date(Date.now() + 86400000 * dateOffset),
                status: randomStatus,
                UserId: admin.id,
                SocialAccountId: randomAcc.id,
                link: randomStatus === 'posted' ? 'https://example.com' : null
            });
        }

        await ContentPlan.bulkCreate(plans);

        console.log('✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();
