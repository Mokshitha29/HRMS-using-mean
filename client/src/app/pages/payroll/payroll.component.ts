import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Payroll, PaymentStatus } from '../../models/payroll.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css'],
})
export class PayrollComponent implements OnInit {
  payrollRecords: Payroll[] = [];
  employees: Employee[] = [];
  loading = true;
  submitting = false;

  // Filters
  filterMonth = 'All';
  filterYear: number | string = 'All';
  filterStatus = 'All';
  filterEmployee = 'All';

  // Modal State
  showModal = false;
  isEditMode = false;
  currentEditId: string | null = null;
  payrollForm!: FormGroup;

  // Delete Candidate
  deleteCandidate: Payroll | null = null;
  deleting = false;

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years: number[] = [2023, 2024, 2025, 2026];

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPayroll();
    if (this.isAdminOrHr()) {
      this.loadEmployees();
    }
  }

  initForm(): void {
    const currentMonth = this.months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    this.payrollForm = this.fb.group({
      employeeId: ['', Validators.required],
      month: [currentMonth, Validators.required],
      year: [currentYear, [Validators.required, Validators.min(2000)]],
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      allowances: [0, [Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      paymentStatus: ['Pending', Validators.required],
    });
  }

  get f() {
    return this.payrollForm.controls;
  }

  get calculatedNetSalary(): number {
    const basic = Number(this.payrollForm.get('basicSalary')?.value) || 0;
    const allowances = Number(this.payrollForm.get('allowances')?.value) || 0;
    const deductions = Number(this.payrollForm.get('deductions')?.value) || 0;
    return Math.max(0, basic + allowances - deductions);
  }

  isAdminOrHr(): boolean {
    return this.authService.hasRole(['ADMIN', 'HR']);
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data;
          if (this.employees.length > 0 && !this.payrollForm.value.employeeId) {
            this.onEmployeeSelect(this.employees[0]._id!);
          }
        }
      },
    });
  }

  onEmployeeSelect(empId: string): void {
    this.payrollForm.patchValue({ employeeId: empId });
    // Pre-fill basic salary with the employee's monthly rate (annual / 12)
    const emp = this.employees.find((e) => e._id === empId);
    if (emp && emp.salary) {
      const monthly = Math.round(emp.salary / 12);
      this.payrollForm.patchValue({ basicSalary: monthly });
    }
  }

  loadPayroll(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterMonth !== 'All') params.month = this.filterMonth;
    if (this.filterYear !== 'All') params.year = Number(this.filterYear);
    if (this.filterStatus !== 'All') params.paymentStatus = this.filterStatus;
    if (this.filterEmployee !== 'All') params.employeeId = this.filterEmployee;

    this.payrollService.getAll(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.payrollRecords = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching payroll:', err);
      },
    });
  }

  onFilterChange(): void {
    this.loadPayroll();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    const currentMonth = this.months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const defaultEmp = this.employees[0];
    const defaultBasic = defaultEmp?.salary ? Math.round(defaultEmp.salary / 12) : 0;

    this.payrollForm.reset({
      employeeId: defaultEmp?._id || '',
      month: currentMonth,
      year: currentYear,
      basicSalary: defaultBasic,
      allowances: 0,
      deductions: 0,
      paymentStatus: 'Pending',
    });

    this.showModal = true;
  }

  openEditModal(record: Payroll): void {
    this.isEditMode = true;
    this.currentEditId = record._id || null;

    const empId = typeof record.employeeId === 'object' ? record.employeeId._id : record.employeeId;

    this.payrollForm.patchValue({
      employeeId: empId,
      month: record.month,
      year: record.year,
      basicSalary: record.basicSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      paymentStatus: record.paymentStatus,
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitPayroll(): void {
    if (this.payrollForm.invalid) {
      this.payrollForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const val = this.payrollForm.value;

    if (this.isEditMode && this.currentEditId) {
      this.payrollService.update(this.currentEditId, val).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadPayroll();
        },
        error: (err) => {
          this.submitting = false;
          alert(err.error?.message || 'Error updating payroll record');
        },
      });
    } else {
      this.payrollService.create(val).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadPayroll();
        },
        error: (err) => {
          this.submitting = false;
          alert(err.error?.message || 'Error generating payroll');
        },
      });
    }
  }

  markAsPaid(record: Payroll): void {
    if (!record._id) return;
    this.payrollService.markAsPaid(record._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          record.paymentStatus = res.data.paymentStatus;
          record.paymentDate = res.data.paymentDate;
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to mark payroll as paid');
      },
    });
  }

  confirmDelete(): void {
    if (!this.deleteCandidate?._id) return;
    this.deleting = true;
    this.payrollService.delete(this.deleteCandidate._id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteCandidate = null;
        this.loadPayroll();
      },
      error: (err) => {
        this.deleting = false;
        alert(err.error?.message || 'Failed to delete payroll record');
      },
    });
  }

  getEmployeeDisplayName(emp: any): string {
    if (!emp) return 'N/A';
    if (typeof emp === 'object') {
      return `${emp.firstName} ${emp.lastName} (${emp.employeeId || ''})`;
    }
    return emp;
  }
}
