import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Leave, LeaveType } from '../../models/leave.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css'],
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  employees: Employee[] = [];
  loading = true;
  submitting = false;

  // Filters
  filterStatus = 'All';
  filterEmployee = 'All';

  // Apply Modal
  showApplyModal = false;
  leaveForm!: FormGroup;

  // Delete candidate
  deleteCandidate: Leave | null = null;
  deleting = false;

  leaveTypes: LeaveType[] = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Other'];

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLeaves();
    if (this.isAdminOrHr()) {
      this.loadEmployees();
    }
  }

  initForm(): void {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    this.leaveForm = this.fb.group({
      employeeId: [''],
      leaveType: ['Casual Leave', Validators.required],
      fromDate: [tomorrow, Validators.required],
      toDate: [dayAfter, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  get f() {
    return this.leaveForm.controls;
  }

  isAdminOrHr(): boolean {
    return this.authService.hasRole(['ADMIN', 'HR']);
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data;
          if (this.employees.length > 0 && !this.leaveForm.value.employeeId) {
            this.leaveForm.patchValue({ employeeId: this.employees[0]._id });
          }
        }
      },
    });
  }

  loadLeaves(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus !== 'All') params.status = this.filterStatus;
    if (this.filterEmployee !== 'All') params.employeeId = this.filterEmployee;

    this.leaveService.getAll(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.leaves = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching leaves:', err);
      },
    });
  }

  onFilterChange(): void {
    this.loadLeaves();
  }

  openApplyModal(): void {
    const currentUser = this.authService.currentUserValue;
    const defaultEmpId =
      currentUser?.role === 'EMPLOYEE'
        ? currentUser.employeeId?._id || currentUser.employeeId || ''
        : this.employees[0]?._id || '';

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    this.leaveForm.reset({
      employeeId: defaultEmpId,
      leaveType: 'Casual Leave',
      fromDate: tomorrow,
      toDate: dayAfter,
      reason: '',
    });

    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.leaveService.apply(this.leaveForm.value).subscribe({
      next: () => {
        this.submitting = false;
        this.closeApplyModal();
        this.loadLeaves();
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.message || 'Failed to submit leave application');
      },
    });
  }

  updateStatus(leave: Leave, newStatus: 'Approved' | 'Rejected'): void {
    if (!leave._id) return;
    this.leaveService.updateStatus(leave._id, newStatus).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          leave.status = res.data.status;
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update leave status');
      },
    });
  }

  confirmDelete(): void {
    if (!this.deleteCandidate?._id) return;
    this.deleting = true;
    this.leaveService.delete(this.deleteCandidate._id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteCandidate = null;
        this.loadLeaves();
      },
      error: (err) => {
        this.deleting = false;
        alert(err.error?.message || 'Failed to delete leave request');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getEmployeeDisplayName(emp: any): string {
    if (!emp) return 'N/A';
    if (typeof emp === 'object') {
      return `${emp.firstName} ${emp.lastName} (${emp.employeeId || ''})`;
    }
    return emp;
  }
}
