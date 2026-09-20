import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Leave } from '../models/leave.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly apiUrl = 'http://localhost:5000/api/leaves';

  constructor(private http: HttpClient) {}

  getAll(params?: { status?: string; employeeId?: string }): Observable<ApiResponse<Leave[]>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);

    return this.http.get<ApiResponse<Leave[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Leave>> {
    return this.http.get<ApiResponse<Leave>>(`${this.apiUrl}/${id}`);
  }

  apply(leave: Partial<Leave>): Observable<ApiResponse<Leave>> {
    return this.http.post<ApiResponse<Leave>>(this.apiUrl, leave);
  }

  updateStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected'): Observable<ApiResponse<Leave>> {
    return this.http.put<ApiResponse<Leave>>(`${this.apiUrl}/${id}`, { status });
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
