import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  approvedLeaves: number;
  totalPayrollRecords: number;
  recentLeaves: any[];
  recentEmployees: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  readonly apiUrl = 'https://hrms-backend-jab9.onrender.com/api/dashboard/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(this.apiUrl);
  }
}
