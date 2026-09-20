const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get attendance records with optional filtering
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;
    let query = {};

    // If logged-in user is an EMPLOYEE, only show their own attendance
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      query.employeeId = req.user.employeeId;
    } else if (employeeId && employeeId !== 'All') {
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employeeId = employeeId;
      }
    }

    // Filter by date (match day boundaries)
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId', 'employeeId firstName lastName department designation')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error('getAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance records',
    });
  }
};

// @desc    Get single attendance record by ID
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Attendance record ID',
      });
    }

    const record = await Attendance.findById(id).populate(
      'employeeId',
      'employeeId firstName lastName department designation'
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Employee authorization check
    if (
      req.user.role === 'EMPLOYEE' &&
      record.employeeId._id.toString() !== req.user.employeeId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view attendance records of other employees',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching attendance record',
    });
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
  try {
    let { employeeId, date, checkIn, checkOut, status } = req.body;

    // If EMPLOYEE is marking their own attendance
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Your user account is not linked to any employee record',
        });
      }
      employeeId = req.user.employeeId;
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an employee ID',
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const recordDate = date ? new Date(date) : new Date();

    const newRecord = await Attendance.create({
      employeeId,
      date: recordDate,
      checkIn: checkIn || '09:00 AM',
      checkOut: checkOut || '06:00 PM',
      status: status || 'Present',
    });

    const populatedRecord = await Attendance.findById(newRecord._id).populate(
      'employeeId',
      'employeeId firstName lastName department'
    );

    return res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: populatedRecord,
    });
  } catch (error) {
    console.error('markAttendance error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error marking attendance',
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (ADMIN, HR)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Attendance record ID',
      });
    }

    let record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    record = await Attendance.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('employeeId', 'employeeId firstName lastName department');

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('updateAttendance error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error updating attendance record',
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (ADMIN, HR)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Attendance record ID',
      });
    }

    const record = await Attendance.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('deleteAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting attendance record',
    });
  }
};

module.exports = {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
};
