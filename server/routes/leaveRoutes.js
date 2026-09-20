const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getLeaveById,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getLeaves)
  .post(applyLeave);

router
  .route('/:id')
  .get(getLeaveById)
  .put(authorize('ADMIN', 'HR'), updateLeaveStatus)
  .delete(deleteLeave);

module.exports = router;
