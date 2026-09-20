import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Attendance } from '../../models/attendance.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: Attendance[] = [];
  employees: Employee[] = [];
  loading = true;
  submitting = false;

  // Filters
  filterDate = '';
  filterEmployee = 'All';
  filterStatus = 'All';

  // Modal / Form state
  showModal = false;
  isEditMode = false;
  currentEditId: string | null = null;
  attendanceForm!: FormGroup;

  // Delete candidate
  deleteCandidate: Attendance | null = null;
  deleting = false;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRecords();
    if (this.isAdminOrHr()) {
      this.loadEmployees();
    }
  }

  initForm(): void {
    const todayStr = new Date().toISOString().substring(0, 10);
    this.attendanceForm = this.fb.group({
      employeeId: ['', Validators.required],
      date: [todayStr, Validators.required],
      checkIn: ['09:00 AM', Validators.required],
      checkOut: ['06:00 PM'],
      status: ['Present', Validators.required],
    });
  }

  get f() {
    return this.attendanceForm.controls;
  }

  isAdminOrHr(): boolean {
    return this.authService.hasRole(['ADMIN', 'HR']);
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data;
          // Set default employee in form if available
          if (this.employees.length > 0 && !this.attendanceForm.value.employeeId) {
            this.attendanceForm.patchValue({ employeeId: this.employees[0]._id });
          }
        }
      },
    });
  }

  loadRecords(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterDate) params.date = this.filterDate;
    if (this.filterEmployee !== 'All') params.employeeId = this.filterEmployee;
    if (this.filterStatus !== 'All') params.status = this.filterStatus;

    this.attendanceService.getAll(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.attendanceRecords = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching attendance:', err);
      },
    });
  }

  onFilterChange(): void {
    this.loadRecords();
  }

  openMarkModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    const todayStr = new Date().toISOString().substring(0, 10);

    const currentUser = this.authService.currentUserValue;
    const defaultEmpId =
      currentUser?.role === 'EMPLOYEE'
        ? currentUser.employeeId?._id || currentUser.employeeId || ''
        : this.employees[0]?._id || '';

    this.attendanceForm.reset({
      employeeId: defaultEmpId,
      date: todayStr,
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      status: 'Present',
    });

    this.showModal = true;
  }

  openEditModal(record: Attendance): void {
    this.isEditMode = true;
    this.currentEditId = record._id || null;

    const empId = typeof record.employeeId === 'object' ? record.employeeId._id : record.employeeId;
    const recordDate = new Date(record.date).toISOString().substring(0, 10);

    this.attendanceForm.patchValue({
      employeeId: empId,
      date: recordDate,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitAttendance(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const val = this.attendanceForm.value;

    if (this.isEditMode && this.currentEditId) {
      this.attendanceService.update(this.currentEditId, val).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRecords();
        },
        error: (err) => {
          this.submitting = false;
          alert(err.error?.message || 'Failed to update attendance');
        },
      });
    } else {
      this.attendanceService.mark(val).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal();
          this.loadRecords();
        },
        error: (err) => {
          this.submitting = false;
          alert(err.error?.message || 'Failed to log attendance');
        },
      });
    }
  }

  confirmDeleteRecord(): void {
    if (!this.deleteCandidate?._id) return;
    this.deleting = true;
    this.attendanceService.delete(this.deleteCandidate._id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteCandidate = null;
        this.loadRecords();
      },
      error: (err) => {
        this.deleting = false;
        alert(err.error?.message || 'Failed to delete attendance record');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Present':
        return 'bg-success';
      case 'Absent':
        return 'bg-danger';
      case 'Half Day':
        return 'bg-warning text-dark';
      case 'Leave':
        return 'bg-info text-dark';
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
