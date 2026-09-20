const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please provide an employee reference'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the attendance date'],
      default: Date.now,
    },
    checkIn: {
      type: String,
      default: '09:00 AM',
      trim: true,
    },
    checkOut: {
      type: String,
      default: '06:00 PM',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave'],
      default: 'Present',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help avoid duplicate attendance entries for same employee on same date
attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
