const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authMiddleware, superadminOnly } = require('../middleware/auth');

// All routes require superadmin
router.use(authMiddleware, superadminOnly);

router.get('/', teamController.getAllTeams);
router.post('/', teamController.createTeam);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;
