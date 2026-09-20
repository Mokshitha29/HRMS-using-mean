export interface Employee {
  _id?: string;
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string | Date;
  department: string;
  designation: string;
  joiningDate: string | Date;
  salary: number;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}
