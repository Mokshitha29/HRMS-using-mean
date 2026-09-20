const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc    Get payroll records with optional filtering
// @route   GET /api/payroll
// @access  Private
const getPayroll = async (req, res) => {
  try {
    const { month, year, paymentStatus, employeeId } = req.query;
    let query = {};

    // If logged-in user is an EMPLOYEE, only show their own payroll
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

    if (month && month !== 'All') {
      query.month = month;
    }

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    const records = await Payroll.find(query)
      .populate('employeeId', 'employeeId firstName lastName department designation')
      .sort({ year: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('getPayroll error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payroll records',
    });
  }
};

// @desc    Get single payroll record by ID
// @route   GET /api/payroll/:id
// @access  Private
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Payroll ID format',
      });
    }

    const record = await Payroll.findById(id).populate(
      'employeeId',
      'employeeId firstName lastName department designation email'
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    // Employee authorization check
    if (
      req.user.role === 'EMPLOYEE' &&
      record.employeeId._id.toString() !== req.user.employeeId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view payroll records of other employees',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payroll record',
    });
  }
};

// @desc    Create new payroll record
// @route   POST /api/payroll
// @access  Private (ADMIN, HR)
const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      paymentStatus = 'Pending',
    } = req.body;

    if (!employeeId || !month || !year || basicSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId, month, year, and basicSalary',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if payroll record already exists for this employee for this month/year
    const existing = await Payroll.findOne({ employeeId, month, year: Number(year) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${employee.firstName} ${employee.lastName} for ${month} ${year} already exists`,
      });
    }

    const basic = Number(basicSalary);
    const allow = Number(allowances) || 0;
    const deduct = Number(deductions) || 0;
    const netSalary = Math.max(0, basic + allow - deduct);

    const payroll = await Payroll.create({
      employeeId,
      month,
      year: Number(year),
      basicSalary: basic,
      allowances: allow,
      deductions: deduct,
      netSalary,
      paymentStatus,
      paymentDate: paymentStatus === 'Paid' ? new Date() : null,
    });

    const populated = await Payroll.findById(payroll._id).populate(
      'employeeId',
      'employeeId firstName lastName department designation'
    );

    return res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: populated,
    });
  } catch (error) {
    console.error('createPayroll error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating payroll record',
    });
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (ADMIN, HR)
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Payroll ID format',
      });
    }

    let record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    const basic = req.body.basicSalary !== undefined ? Number(req.body.basicSalary) : record.basicSalary;
    const allow = req.body.allowances !== undefined ? Number(req.body.allowances) : record.allowances;
    const deduct = req.body.deductions !== undefined ? Number(req.body.deductions) : record.deductions;
    const netSalary = Math.max(0, basic + allow - deduct);

    const updateData = {
      ...req.body,
      basicSalary: basic,
      allowances: allow,
      deductions: deduct,
      netSalary,
    };

    if (req.body.paymentStatus === 'Paid' && record.paymentStatus !== 'Paid') {
      updateData.paymentDate = new Date();
    } else if (req.body.paymentStatus === 'Pending') {
      updateData.paymentDate = null;
    }

    record = await Payroll.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('employeeId', 'employeeId firstName lastName department designation');

    return res.status(200).json({
      success: true,
      message: 'Payroll record updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('updatePayroll error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error updating payroll record',
    });
  }
};

// @desc    Mark payroll as Paid
// @route   PUT /api/payroll/:id/pay
// @access  Private (ADMIN, HR)
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Payroll ID format',
      });
    }

    const record = await Payroll.findByIdAndUpdate(
      id,
      { paymentStatus: 'Paid', paymentDate: new Date() },
      { new: true }
    ).populate('employeeId', 'employeeId firstName lastName department');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payroll marked as Paid',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error marking payroll as paid',
    });
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (ADMIN, HR)
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Payroll ID format',
      });
    }

    const record = await Payroll.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('deletePayroll error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting payroll record',
    });
  }
};

module.exports = {
  getPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  markAsPaid,
  deletePayroll,
};
