import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage = res.message || 'Login failed. Please check credentials.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Unable to connect to HRMS server. Please try again.';
      },
    });
  }

  quickFill(role: string): void {
    if (role === 'ADMIN') {
      this.loginForm.patchValue({
        email: 'admin@hrms.com',
        password: 'Admin@123',
      });
    } else if (role === 'HR') {
      this.loginForm.patchValue({
        email: 'hr@hrms.com',
        password: 'Hr@123',
      });
    } else if (role === 'EMPLOYEE') {
      this.loginForm.patchValue({
        email: 'employee1@hrms.com',
        password: 'Emp@123',
      });
    }
  }
}
