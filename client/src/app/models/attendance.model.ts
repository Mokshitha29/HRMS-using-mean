import { Employee } from './employee.model';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave';

export interface Attendance {
  _id?: string;
  id?: string;
  employeeId: string | Employee;
  date: string | Date;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  createdAt?: string;
  updatedAt?: string;
}
