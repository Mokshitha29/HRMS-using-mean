import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  currentUser: User | null = null;

  constructor(public authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  isEmployee(): boolean {
    return this.currentUser?.role === 'EMPLOYEE';
  }

  isAdminOrHr(): boolean {
    return this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'HR';
  }

  logout(): void {
    this.authService.logout();
  }
}
