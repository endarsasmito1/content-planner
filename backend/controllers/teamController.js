const Team = require('../models/Team');
const User = require('../models/User');

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.findAll({
            include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }] // Include members
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching teams' });
    }
};

// Create team
exports.createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Team.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: 'Team name already exists' });
        }

        const team = await Team.create({ name, description });
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Server error creating team' });
    }
};

// Update team
exports.updateTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const team = await Team.findByPk(req.params.id);

        if (!team) return res.status(404).json({ error: 'Team not found' });

        team.name = name || team.name;
        team.description = description || team.description;
        await team.save();

        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Server error updating team' });
    }
};

// Delete team
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        // Optional: Check if users assigned?
        // For now, let's set Users' TeamId to null
        await User.update({ TeamId: null }, { where: { TeamId: team.id } });

        await team.destroy();
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting team' });
    }
};
