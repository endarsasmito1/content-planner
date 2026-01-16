const ContentPlan = require('../models/ContentPlan');
const SocialAccount = require('../models/SocialAccount');
const User = require('../models/User');

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await ContentPlan.findAll({
            include: [
                { model: SocialAccount, attributes: ['id', 'platform', 'username'] },
                { model: User, attributes: ['id', 'username'] }
            ],
            order: [['postingDate', 'ASC']]
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const { title, caption, postingDate, link, resourceLink, socialAccountId, status } = req.body;

        const newPlan = await ContentPlan.create({
            title,
            caption,
            postingDate,
            link,
            resourceLink,
            SocialAccountId: socialAccountId,
            UserId: req.user.id,
            status: status || 'draft'
        });

        // Refetch to include relations
        const planWithRelations = await ContentPlan.findByPk(newPlan.id, {
            include: [
                { model: SocialAccount, attributes: ['id', 'platform', 'username'] },
                { model: User, attributes: ['id', 'username'] }
            ]
        });

        res.status(201).json(planWithRelations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, caption, postingDate, link, resourceLink, socialAccountId, status, views, likes, comments } = req.body;

        const plan = await ContentPlan.findByPk(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        plan.title = title || plan.title;
        plan.caption = caption !== undefined ? caption : plan.caption;
        plan.postingDate = postingDate || plan.postingDate;
        plan.link = link !== undefined ? link : plan.link;
        plan.resourceLink = resourceLink !== undefined ? resourceLink : plan.resourceLink;
        if (socialAccountId) plan.SocialAccountId = socialAccountId;
        if (status) plan.status = status;
        if (views !== undefined) plan.views = views;
        if (likes !== undefined) plan.likes = likes;
        if (comments !== undefined) plan.comments = comments;

        await plan.save();

        const updatedPlan = await ContentPlan.findByPk(id, {
            include: [
                { model: SocialAccount, attributes: ['id', 'platform', 'username'] },
                { model: User, attributes: ['id', 'username'] }
            ]
        });

        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await ContentPlan.findByPk(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        await plan.destroy();
        res.json({ message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
