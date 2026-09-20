import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  readonly apiUrl = 'https://hrms-backend-jab9.onrender.com/api/employees';

  constructor(private http: HttpClient) {}

  getAll(params?: { search?: string; department?: string; status?: string }): Observable<ApiResponse<Employee[]>> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.department) httpParams = httpParams.set('department', params.department);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<Employee[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`);
  }

  create(employee: Partial<Employee>): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, employee);
  }

  update(id: string, employee: Partial<Employee>): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, employee);
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
