const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding.');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});

    console.log('Inserting 5 sample employees...');
    const employees = await Employee.create([
      {
        employeeId: 'EMP-001',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah.connor@hrms.com',
        phone: '+1 555-0101',
        gender: 'Female',
        dateOfBirth: new Date('1990-05-14'),
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        joiningDate: new Date('2021-03-01'),
        salary: 85000,
        address: '100 Innovation Way, San Jose, CA',
        status: 'Active',
      },
      {
        employeeId: 'EMP-002',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hrms.com',
        phone: '+1 555-0102',
        gender: 'Male',
        dateOfBirth: new Date('1988-11-23'),
        department: 'Human Resources',
        designation: 'HR Specialist',
        joiningDate: new Date('2020-07-15'),
        salary: 62000,
        address: '240 Maple Avenue, Austin, TX',
        status: 'Active',
      },
      {
        employeeId: 'EMP-003',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@hrms.com',
        phone: '+1 555-0103',
        gender: 'Female',
        dateOfBirth: new Date('1993-02-18'),
        department: 'Finance',
        designation: 'Financial Analyst',
        joiningDate: new Date('2022-01-10'),
        salary: 70000,
        address: '75 Wall Street, New York, NY',
        status: 'Active',
      },
      {
        employeeId: 'EMP-004',
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@hrms.com',
        phone: '+1 555-0104',
        gender: 'Male',
        dateOfBirth: new Date('1995-09-30'),
        department: 'Marketing',
        designation: 'Digital Marketing Specialist',
        joiningDate: new Date('2022-06-01'),
        salary: 58000,
        address: '500 Sunset Blvd, Los Angeles, CA',
        status: 'Active',
      },
      {
        employeeId: 'EMP-005',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@hrms.com',
        phone: '+1 555-0105',
        gender: 'Female',
        dateOfBirth: new Date('1992-08-12'),
        department: 'Engineering',
        designation: 'DevOps Engineer',
        joiningDate: new Date('2023-02-15'),
        salary: 82000,
        address: '320 Tech Park, Seattle, WA',
        status: 'Active',
      },
    ]);

    console.log('Employees created successfully.');

    // Passwords hash
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const hrPassword = await bcrypt.hash('Hr@123', 10);
    const empPassword = await bcrypt.hash('Emp@123', 10);

    console.log('Inserting sample users (1 Admin, 2 HR, 2 Employees)...');
    await User.create([
      // 1 Admin user
      {
        name: 'System Administrator',
        email: 'admin@hrms.com',
        password: adminPassword,
        role: 'ADMIN',
        employeeId: null,
      },
      // 2 HR users
      {
        name: 'John Doe (HR)',
        email: 'hr@hrms.com',
        password: hrPassword,
        role: 'HR',
        employeeId: employees[1]._id, // Linked to John Doe
      },
      {
        name: 'HR Associate',
        email: 'hr2@hrms.com',
        password: hrPassword,
        role: 'HR',
        employeeId: null,
      },
      // 2 Employee users
      {
        name: 'Sarah Connor',
        email: 'employee1@hrms.com',
        password: empPassword,
        role: 'EMPLOYEE',
        employeeId: employees[0]._id, // Linked to Sarah Connor
      },
      {
        name: 'Emily Watson',
        email: 'employee2@hrms.com',
        password: empPassword,
        role: 'EMPLOYEE',
        employeeId: employees[4]._id, // Linked to Emily Watson
      },
    ]);

    console.log('Users created successfully.');

    console.log('Inserting 5 attendance records...');
    const today = new Date();
    await Attendance.create([
      {
        employeeId: employees[0]._id,
        date: today,
        checkIn: '09:05 AM',
        checkOut: '06:00 PM',
        status: 'Present',
      },
      {
        employeeId: employees[1]._id,
        date: today,
        checkIn: '08:55 AM',
        checkOut: '05:45 PM',
        status: 'Present',
      },
      {
        employeeId: employees[2]._id,
        date: today,
        checkIn: '09:30 AM',
        checkOut: '01:30 PM',
        status: 'Half Day',
      },
      {
        employeeId: employees[3]._id,
        date: today,
        checkIn: '',
        checkOut: '',
        status: 'Absent',
      },
      {
        employeeId: employees[4]._id,
        date: today,
        checkIn: '09:00 AM',
        checkOut: '06:10 PM',
        status: 'Present',
      },
    ]);

    console.log('Attendance records created.');

    console.log('Inserting 3 leave records...');
    await Leave.create([
      {
        employeeId: employees[0]._id,
        leaveType: 'Sick Leave',
        fromDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        reason: 'Medical appointment and recovery',
        status: 'Pending',
        appliedDate: new Date(),
      },
      {
        employeeId: employees[2]._id,
        leaveType: 'Casual Leave',
        fromDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        reason: 'Family event out of state',
        status: 'Approved',
        appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        employeeId: employees[3]._id,
        leaveType: 'Earned Leave',
        fromDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        reason: 'Personal vacation request',
        status: 'Rejected',
        appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Leave records created.');

    console.log('Inserting 3 payroll records...');
    await Payroll.create([
      {
        employeeId: employees[0]._id,
        month: 'May',
        year: 2024,
        basicSalary: 7083,
        allowances: 500,
        deductions: 200,
        netSalary: 7383,
        paymentStatus: 'Paid',
        paymentDate: new Date('2024-05-31'),
      },
      {
        employeeId: employees[1]._id,
        month: 'May',
        year: 2024,
        basicSalary: 5166,
        allowances: 350,
        deductions: 150,
        netSalary: 5366,
        paymentStatus: 'Paid',
        paymentDate: new Date('2024-05-31'),
      },
      {
        employeeId: employees[4]._id,
        month: 'June',
        year: 2024,
        basicSalary: 6833,
        allowances: 400,
        deductions: 180,
        netSalary: 7053,
        paymentStatus: 'Pending',
        paymentDate: null,
      },
    ]);

    console.log('Payroll records created.');
    console.log('\n===========================================');
    console.log(' HRMS DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('===========================================');
    console.log('Sample Accounts Created:');
    console.log('  1. ADMIN:    admin@hrms.com      / Admin@123');
    console.log('  2. HR:       hr@hrms.com         / Hr@123');
    console.log('  3. HR 2:     hr2@hrms.com        / Hr@123');
    console.log('  4. EMPLOYEE: employee1@hrms.com  / Emp@123 (Sarah Connor)');
    console.log('  5. EMPLOYEE: employee2@hrms.com  / Emp@123 (Emily Watson)');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
