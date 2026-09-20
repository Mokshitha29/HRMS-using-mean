const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAttendance)
  .post(markAttendance);

router
  .route('/:id')
  .get(getAttendanceById)
  .put(authorize('ADMIN', 'HR'), updateAttendance)
  .delete(authorize('ADMIN', 'HR'), deleteAttendance);

module.exports = router;
