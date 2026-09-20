const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// @desc    Get all employees with optional search & department filtering
// @route   GET /api/employees
// @access  Private
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = {};

    // Filter by department if provided
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search query for name, email or employeeId
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('getAllEmployees error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching employees',
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format',
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching employee details',
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (ADMIN, HR)
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      department,
      designation,
      joiningDate,
      salary,
      address,
      status,
    } = req.body;

    // Check for existing employee with same employeeId or email
    const existingId = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee with ID '${employeeId}' already exists`,
      });
    }

    const existingEmail = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Employee with email '${email}' already exists`,
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      gender,
      dateOfBirth,
      department: department.trim(),
      designation: designation.trim(),
      joiningDate,
      salary: Number(salary),
      address: address.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    console.error('createEmployee error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating employee',
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (ADMIN, HR)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format',
      });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check unique employeeId if updated
    if (req.body.employeeId && req.body.employeeId !== employee.employeeId) {
      const idExists = await Employee.findOne({ employeeId: req.body.employeeId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: `Employee ID '${req.body.employeeId}' is already assigned to another employee`,
        });
      }
    }

    // Check unique email if updated
    if (req.body.email && req.body.email.toLowerCase() !== employee.email) {
      const emailExists = await Employee.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `Email '${req.body.email}' is already in use by another employee`,
        });
      }
    }

    employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('updateEmployee error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error updating employee',
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (ADMIN, HR)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Employee ID format',
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Delete employee and related records
    await Employee.findByIdAndDelete(id);
    await Attendance.deleteMany({ employeeId: id });
    await Leave.deleteMany({ employeeId: id });
    await Payroll.deleteMany({ employeeId: id });

    return res.status(200).json({
      success: true,
      message: 'Employee and associated records deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('deleteEmployee error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting employee',
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
