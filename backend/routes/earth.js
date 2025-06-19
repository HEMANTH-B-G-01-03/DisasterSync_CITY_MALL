const express = require('express');
const { login, addUser, deleteUser } = require('../controllers/authController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', login);
router.post('/add-user', verifyAdmin, addUser); // Only admin can add users
router.delete("/users/:id", verifyAdmin, deleteUser);
module.exports = router;
