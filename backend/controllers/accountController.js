const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');

exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await SocialAccount.findAll({
            include: [{ model: User, attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const { platform, username, link } = req.body;
        const newAccount = await SocialAccount.create({
            platform,
            username,
            link,
            UserId: req.user.id // "Diinput oleh"
        });

        // Fetch again to include User data for immediate UI update
        const accountWithUser = await SocialAccount.findByPk(newAccount.id, {
            include: [{ model: User, attributes: ['id', 'username'] }]
        });

        res.status(201).json(accountWithUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, username, link } = req.body;

        const account = await SocialAccount.findByPk(id);
        if (!account) return res.status(404).json({ error: 'Account not found' });

        account.platform = platform || account.platform;
        account.username = username || account.username;
        account.link = link || account.link;

        await account.save();

        const updatedAccount = await SocialAccount.findByPk(id, {
            include: [{ model: User, attributes: ['id', 'username'] }]
        });

        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await SocialAccount.findByPk(id);
        if (!account) return res.status(404).json({ error: 'Account not found' });

        await account.destroy();
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
