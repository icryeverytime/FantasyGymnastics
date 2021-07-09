import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gymnast } from '../models/gymnast.model';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GymnastService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getGymnast(gymnastDocumentID: string): Observable<Gymnast> {
    return this.http.post<Gymnast>('/api/gymnast', {
      gymnastDocumentID: gymnastDocumentID
    }, { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  getAllGymnasts(): Observable<Gymnast[]>{
    return this.http.get<Gymnast[]>('/api/getAllGymnasts', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
}
