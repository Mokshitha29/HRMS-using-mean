const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide an employee reference'],
    },
    month: {
      type: String,
      required: [true, 'Please provide payroll month'],
      enum: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },
    year: {
      type: Number,
      required: [true, 'Please provide payroll year'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Please provide basic salary'],
      min: [0, 'Basic salary cannot be negative'],
    },
    allowances: {
      type: Number,
      default: 0,
      min: [0, 'Allowances cannot be negative'],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative'],
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure netSalary is always accurate
payrollSchema.pre('validate', function (next) {
  const basic = Number(this.basicSalary) || 0;
  const allow = Number(this.allowances) || 0;
  const deduct = Number(this.deductions) || 0;
  this.netSalary = Math.max(0, basic + allow - deduct);
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
