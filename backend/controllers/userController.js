const User = require('../models/User');
const Team = require('../models/Team');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Superadmin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'avatarUrl', 'dateJoined', 'phoneNumber', 'activeUntil', 'TeamId'],
            include: [{ model: Team, attributes: ['id', 'name'] }]
        });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Superadmin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'email', 'role', 'avatarUrl', 'dateJoined', 'phoneNumber', 'activeUntil', 'TeamId'],
            include: [{ model: Team, attributes: ['id', 'name'] }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   POST /api/users
// @desc    Create new user (by admin)
// @access  Private/Superadmin
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, phoneNumber, activeUntil, TeamId } = req.body;

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
            password, // Hook will hash
            role: role || 'user',
            phoneNumber,
            activeUntil,
            TeamId
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                dateJoined: user.dateJoined,
                phoneNumber: user.phoneNumber,
                activeUntil: user.activeUntil,
                TeamId: user.TeamId
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Superadmin
exports.updateUser = async (req, res) => {
    try {
        const { username, email, role, password, phoneNumber, activeUntil, TeamId } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = password;

        // Allow updating optional fields (even setting to null if passed specifically? For simplistic update, we check undefined)
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (activeUntil !== undefined) user.activeUntil = activeUntil;
        if (TeamId !== undefined) user.TeamId = TeamId;

        await user.save();

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                dateJoined: user.dateJoined,
                phoneNumber: user.phoneNumber,
                activeUntil: user.activeUntil,
                TeamId: user.TeamId
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Superadmin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
