import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly base = '/api/companies';

  constructor(private readonly http: HttpClient) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.base);
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.base}/${id}`);
  }

  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.base}/${company._id}`, company);
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.base, company);
  }

  destroyCompany(id: string): Observable<Company> {
    return this.http.delete<Company>(`${this.base}/${id}`);
  }
}