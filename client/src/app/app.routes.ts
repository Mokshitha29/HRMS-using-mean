import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeeListComponent } from './pages/employees/employee-list.component';
import { EmployeeFormComponent } from './pages/employees/employee-form.component';
import { EmployeeDetailComponent } from './pages/employees/employee-detail.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { LeavesComponent } from './pages/leaves/leaves.component';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected authenticated routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'employees/add',
    component: EmployeeFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'HR'] },
  },
  {
    path: 'employees/edit/:id',
    component: EmployeeFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'HR'] },
  },
  {
    path: 'employees/view/:id',
    component: EmployeeDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [authGuard],
  },
  {
    path: 'leaves',
    component: LeavesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'payroll',
    component: PayrollComponent,
    canActivate: [authGuard],
  },

  // Fallbacks
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
