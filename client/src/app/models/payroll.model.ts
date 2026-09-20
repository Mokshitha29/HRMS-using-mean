import { Employee } from './employee.model';

export type PaymentStatus = 'Pending' | 'Paid';

export interface Payroll {
  _id?: string;
  id?: string;
  employeeId: string | Employee;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string | Date | null;
  createdAt?: string;
  updatedAt?: string;
}
