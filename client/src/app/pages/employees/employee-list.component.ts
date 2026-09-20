import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  searchTerm = '';
  selectedDepartment = 'All';
  selectedStatus = 'All';
  deleteCandidate: Employee | null = null;
  deleting = false;

  departments: string[] = [
    'All',
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
  ];

  constructor(
    private employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    const params: any = {};
    if (this.searchTerm.trim()) params.search = this.searchTerm.trim();
    if (this.selectedDepartment !== 'All') params.department = this.selectedDepartment;
    if (this.selectedStatus !== 'All') params.status = this.selectedStatus;

    this.employeeService.getAll(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.employees = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching employees:', err);
      },
    });
  }

  onFilterChange(): void {
    this.loadEmployees();
  }

  openDeleteModal(emp: Employee): void {
    this.deleteCandidate = emp;
  }

  confirmDelete(): void {
    if (!this.deleteCandidate?._id) return;
    this.deleting = true;
    this.employeeService.delete(this.deleteCandidate._id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.deleteCandidate = null;
        this.loadEmployees();
      },
      error: (err) => {
        this.deleting = false;
        alert(err.error?.message || 'Error deleting employee');
      },
    });
  }

  isAdminOrHr(): boolean {
    return this.authService.hasRole(['ADMIN', 'HR']);
  }
}
