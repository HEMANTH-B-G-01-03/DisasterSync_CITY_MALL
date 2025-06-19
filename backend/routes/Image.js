const express = require('express');
const { getEmployees } = require('../controllers/employeeController');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', verifyAdmin, getEmployees); // Only admin can access this


module.exports = router;
