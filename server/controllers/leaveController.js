const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get leave requests with optional filtering
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    let query = {};

    // If logged-in user is an EMPLOYEE, only show their own leaves
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

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'employeeId firstName lastName department designation email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error('getLeaves error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching leave requests',
    });
  }
};

// @desc    Get single leave request by ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Leave ID format',
      });
    }

    const leave = await Leave.findById(id).populate(
      'employeeId',
      'employeeId firstName lastName department designation'
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Employee authorization check
    if (
      req.user.role === 'EMPLOYEE' &&
      leave.employeeId._id.toString() !== req.user.employeeId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view leave requests of other employees',
      });
    }

    return res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching leave request',
    });
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    let { employeeId, leaveType, fromDate, toDate, reason } = req.body;

    // If EMPLOYEE is applying
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Your user account is not linked to an employee profile',
        });
      }
      employeeId = req.user.employeeId;
    }

    if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (leaveType, fromDate, toDate, reason)',
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    const leave = await Leave.create({
      employeeId,
      leaveType,
      fromDate: start,
      toDate: end,
      reason: reason.trim(),
      status: 'Pending',
      appliedDate: new Date(),
    });

    const populatedLeave = await Leave.findById(leave._id).populate(
      'employeeId',
      'employeeId firstName lastName department'
    );

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave,
    });
  } catch (error) {
    console.error('applyLeave error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error submitting leave application',
    });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id
// @access  Private (ADMIN, HR)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Leave ID format',
      });
    }

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved', 'Rejected', or 'Pending'",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('employeeId', 'employeeId firstName lastName department email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (error) {
    console.error('updateLeaveStatus error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error updating leave status',
    });
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Leave ID format',
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // If EMPLOYEE, can only delete their own PENDING leaves
    if (req.user.role === 'EMPLOYEE') {
      if (leave.employeeId.toString() !== req.user.employeeId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this leave request',
        });
      }
      if (leave.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a leave request that has already been processed',
        });
      }
    }

    await Leave.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('deleteLeave error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting leave request',
    });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
};
