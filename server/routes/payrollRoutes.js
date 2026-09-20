const express = require('express');
const router = express.Router();
const {
  getPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  markAsPaid,
  deletePayroll,
} = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getPayroll)
  .post(authorize('ADMIN', 'HR'), createPayroll);

router
  .route('/:id')
  .get(getPayrollById)
  .put(authorize('ADMIN', 'HR'), updatePayroll)
  .delete(authorize('ADMIN', 'HR'), deletePayroll);

router.put('/:id/pay', authorize('ADMIN', 'HR'), markAsPaid);

module.exports = router;
