import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Attendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:5000/api/attendance';

  constructor(private http: HttpClient) {}

  getAll(params?: { date?: string; employeeId?: string; status?: string }): Observable<ApiResponse<Attendance[]>> {
    let httpParams = new HttpParams();
    if (params?.date) httpParams = httpParams.set('date', params.date);
    if (params?.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Attendance[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Attendance>> {
    return this.http.get<ApiResponse<Attendance>>(`${this.apiUrl}/${id}`);
  }

  mark(attendance: Partial<Attendance>): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(this.apiUrl, attendance);
  }

  update(id: string, attendance: Partial<Attendance>): Observable<ApiResponse<Attendance>> {
    return this.http.put<ApiResponse<Attendance>>(`${this.apiUrl}/${id}`, attendance);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
