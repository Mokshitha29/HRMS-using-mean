import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-top py-3 px-4 text-muted small text-center mt-auto">
      <div class="container-fluid d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div>&copy; 2024 HRMS Enterprise Portal. All rights reserved.</div>
        <div class="d-flex gap-3">
          <span><i class="bi bi-shield-check text-success me-1"></i>Secure JWT Authentication</span>
          <span><i class="bi bi-hdd-network text-primary me-1"></i>MEAN Stack v1.0</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {}
