import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../app/app.component';

export interface IBody {
  user_id: number;
  course: '1M' | '2M' | '3M' | '4M';
  subject: 'LANG' | 'MATH';
  contents: string;
  quantity_exercise: number;
  typeQuestions: "mix" | "dev" | "options";
}

export interface IBodyVerify {
  exercise: Exercise;
  course: '1M' | '2M' | '3M' | '4M';
  subject: 'LANG' | 'MATH';
}

@Injectable({
  providedIn: 'root',
})
export class MainService {

  private readonly DOMAIN = "https://api-educacion.csff.cl";

  constructor(private http: HttpClient) { }

  generateExercises(data: IBody): Observable<any> {
    return this.http.post<any>(`${this.DOMAIN}/assistant-api/exercise/generate`, data);
  }

  verifyExercise(data: IBodyVerify): Observable<any> {
    return this.http.post<any>(`${this.DOMAIN}/assistant-api/exercise/verify`, data);
  }
}
