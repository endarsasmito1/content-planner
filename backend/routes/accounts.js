const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
