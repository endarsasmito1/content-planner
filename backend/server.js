require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Team = require('./models/Team');
const SocialAccount = require('./models/SocialAccount');
const ContentPlan = require('./models/ContentPlan');

// Relations
Team.hasMany(User);
User.belongsTo(Team);

User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);

// Content Plan Relations
User.hasMany(ContentPlan);
ContentPlan.belongsTo(User);

SocialAccount.hasMany(ContentPlan);
ContentPlan.belongsTo(SocialAccount);

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const accountRoutes = require('./routes/accounts');
const planRoutes = require('./routes/plans');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/plans', planRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Content Planner API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
    try {
        // Sync database
        // alter: false to prevent SQLite backup table unique constraint errors during restart
        await sequelize.sync({ alter: false });
        console.log('✅ Database synchronized');

        // Create default superadmin if not exists
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@content.com',
                password: 'admin123',
                role: 'superadmin'
            });
            console.log('✅ Default superadmin created (admin / admin123)');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Endpoints available`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
