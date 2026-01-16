const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ... register (no change needed as team is null, or can be added if needed)
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            name: name || username, // Default name to username if not provided
            role: 'user'
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                dateJoined: user.dateJoined,
                Team: null
            },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};


// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByCredentials(username, password);

        // Fetch full user details with Team
        const userWithTeam = await User.findByPk(user.id, {
            include: [{ model: Team, attributes: ['id', 'name'] }]
        });

        const token = generateToken(userWithTeam);

        res.json({
            success: true,
            user: {
                id: userWithTeam.id,
                username: userWithTeam.username,
                email: userWithTeam.email,
                name: userWithTeam.name,
                role: userWithTeam.role,
                avatarUrl: userWithTeam.avatarUrl,
                dateJoined: userWithTeam.dateJoined,
                phoneNumber: userWithTeam.phoneNumber,
                Team: userWithTeam.Team ? { id: userWithTeam.Team.id, name: userWithTeam.Team.name } : null
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // Fetch fresh user data including phoneNumber and Team
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Team, attributes: ['id', 'name'] }]
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                dateJoined: user.dateJoined,
                phoneNumber: user.phoneNumber,
                Team: user.Team ? { id: user.Team.id, name: user.Team.name } : null
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { username, email, phoneNumber, avatarUrl, name } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Basic duplication check
        if (username && username !== user.username) {
            const exists = await User.findOne({ where: { username } });
            if (exists) return res.status(400).json({ error: 'Username already taken' });
        }
        if (email && email !== user.email) {
            const exists = await User.findOne({ where: { email } });
            if (exists) return res.status(400).json({ error: 'Email already taken' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.avatarUrl = avatarUrl || user.avatarUrl;
        user.name = name || user.name;

        await user.save();

        // Reload to get association
        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Team, attributes: ['id', 'name'] }]
        });

        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl,
                dateJoined: updatedUser.dateJoined,
                phoneNumber: updatedUser.phoneNumber,
                Team: updatedUser.Team ? { id: updatedUser.Team.id, name: updatedUser.Team.name } : null
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate URL
        // Assumes server serves 'public/uploads' at '/uploads'
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({
            success: true,
            avatarUrl: user.avatarUrl,
            message: 'Avatar uploaded successfully'
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

