
const express = require('express');
const {
  getTeamLeader,
  createProject,
  getProjects,
  getAllEmployee,
  getProjectById,
  getProjectsForEmployee,
  getProjectsForTeamLeader,
  updateProjectStatus,
  getAllUsers,
  updatePendingPercentage,
} = require('../controllers/projectController');
const { assignEmployeesToProject } = require('../controllers/teamleaderController');
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();
router.get('/users', getAllUsers);
router.get('/teamLeader', getTeamLeader);
router.get('/employee', getAllEmployee);
router.post('/', createProject);
router.get('/', getProjects);
router.put('/assign-employees/:projectId', assignEmployeesToProject);
router.get('/:projectId', getProjectById);
// For employee
router.get("/employee/projects/:id", authenticateToken, getProjectsForEmployee);
router.get("/teamleader/projects/:id", authenticateToken, getProjectsForTeamLeader);
router.put('/status/:projectId', updateProjectStatus);
router.put('/pending-percentage/:projectId', authenticateToken, updatePendingPercentage);
module.exports = router;
