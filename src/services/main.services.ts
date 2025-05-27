import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IBody {
  course: '1M' | '2M' | '3M' | '4M';
  subject: 'LANG' | 'MATH';
  contents: string;
  quantity_exercise: number;
}

@Injectable({
  providedIn: 'root',
})
export class MainService {

  private readonly DOMAIN = "https://api-educacion.csff.cl";

  constructor(private http: HttpClient) {}

  generateExercises(data: IBody): Observable<any> {
    return this.http.post<any>(`${this.DOMAIN}/assistant-api/getExercisesToSolve`, data);
  }
}
