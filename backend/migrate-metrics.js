const sequelize = require('./config/database');

async function migrateMetrics() {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');

        // Add views, likes, comments columns
        await sequelize.query("ALTER TABLE ContentPlans ADD COLUMN views INTEGER DEFAULT 0;").catch(() => console.log('views column may already exist'));
        await sequelize.query("ALTER TABLE ContentPlans ADD COLUMN likes INTEGER DEFAULT 0;").catch(() => console.log('likes column may already exist'));
        await sequelize.query("ALTER TABLE ContentPlans ADD COLUMN comments INTEGER DEFAULT 0;").catch(() => console.log('comments column may already exist'));

        console.log('✅ Migration complete: views, likes, comments columns added');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrateMetrics();
