import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeIdToEdit: string | null = null;
  loading = false;
  submitting = false;
  errorMessage = '';

  departments: string[] = [
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.employeeIdToEdit = this.route.snapshot.paramMap.get('id');
    if (this.employeeIdToEdit) {
      this.isEditMode = true;
      this.loadEmployeeData(this.employeeIdToEdit);
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+() -]{7,20}$/)]],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', Validators.required],
      department: ['Engineering', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      status: ['Active', Validators.required],
    });
  }

  get f() {
    return this.employeeForm.controls;
  }

  loadEmployeeData(id: string): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          const emp = res.data;
          this.employeeForm.patchValue({
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            gender: emp.gender,
            dateOfBirth: emp.dateOfBirth ? this.formatDate(emp.dateOfBirth) : '',
            department: emp.department,
            designation: emp.designation,
            joiningDate: emp.joiningDate ? this.formatDate(emp.joiningDate) : '',
            salary: emp.salary,
            address: emp.address,
            status: emp.status,
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error fetching employee details';
      },
    });
  }

  private formatDate(dateVal: any): string {
    const d = new Date(dateVal);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = this.employeeForm.value;

    if (this.isEditMode && this.employeeIdToEdit) {
      this.employeeService.update(this.employeeIdToEdit, payload).subscribe({
        next: (res) => {
          this.submitting = false;
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Error updating employee record';
        },
      });
    } else {
      this.employeeService.create(payload).subscribe({
        next: (res) => {
          this.submitting = false;
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Error creating employee';
        },
      });
    }
  }
}
