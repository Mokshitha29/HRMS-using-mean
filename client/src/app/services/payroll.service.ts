import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Payroll } from '../models/payroll.model';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  readonly apiUrl = 'https://hrms-backend-jab9.onrender.com/api/payroll';

  constructor(private http: HttpClient) {}

  getAll(params?: {
    month?: string;
    year?: number;
    paymentStatus?: string;
    employeeId?: string;
  }): Observable<ApiResponse<Payroll[]>> {
    let httpParams = new HttpParams();
    if (params?.month) httpParams = httpParams.set('month', params.month);
    if (params?.year) httpParams = httpParams.set('year', params.year.toString());
    if (params?.paymentStatus) httpParams = httpParams.set('paymentStatus', params.paymentStatus);
    if (params?.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);

    return this.http.get<ApiResponse<Payroll[]>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Payroll>> {
    return this.http.get<ApiResponse<Payroll>>(`${this.apiUrl}/${id}`);
  }

  create(payroll: Partial<Payroll>): Observable<ApiResponse<Payroll>> {
    return this.http.post<ApiResponse<Payroll>>(this.apiUrl, payroll);
  }

  update(id: string, payroll: Partial<Payroll>): Observable<ApiResponse<Payroll>> {
    return this.http.put<ApiResponse<Payroll>>(`${this.apiUrl}/${id}`, payroll);
  }

  markAsPaid(id: string): Observable<ApiResponse<Payroll>> {
    return this.http.put<ApiResponse<Payroll>>(`${this.apiUrl}/${id}/pay`, {});
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
