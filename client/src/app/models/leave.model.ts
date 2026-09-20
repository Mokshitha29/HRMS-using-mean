import { Employee } from './employee.model';

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Leave {
  _id?: string;
  id?: string;
  employeeId: string | Employee;
  leaveType: LeaveType;
  fromDate: string | Date;
  toDate: string | Date;
  reason: string;
  status: LeaveStatus;
  appliedDate?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}
