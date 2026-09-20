const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// @desc    Get dashboard statistics and counts
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Employees
    const totalEmployees = await Employee.countDocuments({ status: 'Active' });

    // 2. Present Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const presentToday = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['Present', 'Half Day'] },
    });

    // 3. Pending Leave Requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 4. Approved Leaves
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });

    // 5. Total Payroll Records
    const totalPayrollRecords = await Payroll.countDocuments();

    // Recent leaves for activity section
    let recentLeavesQuery = {};
    if (req.user.role === 'EMPLOYEE' && req.user.employeeId) {
      recentLeavesQuery.employeeId = req.user.employeeId;
    }

    const recentLeaves = await Leave.find(recentLeavesQuery)
      .populate('employeeId', 'employeeId firstName lastName department')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent employees added
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        pendingLeaves,
        approvedLeaves,
        totalPayrollRecords,
        recentLeaves,
        recentEmployees,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard statistics',
    });
  }
};

module.exports = {
  getDashboardStats,
};
