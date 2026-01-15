const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, superadminOnly } = require('../middleware/auth');

// All routes require authentication AND superadmin role
router.use(authMiddleware, superadminOnly);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
