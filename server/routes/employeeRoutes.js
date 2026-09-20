const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All employee routes are protected
router.use(protect);

router
  .route('/')
  .get(getAllEmployees)
  .post(authorize('ADMIN', 'HR'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('ADMIN', 'HR'), updateEmployee)
  .delete(authorize('ADMIN', 'HR'), deleteEmployee);

module.exports = router;
