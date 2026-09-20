const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide an employee reference'],
    },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Other'],
      required: [true, 'Please select leave type'],
    },
    fromDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    toDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Leave', leaveSchema);
