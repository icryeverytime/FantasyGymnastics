import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../models/team.model';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getTeams() {
    return this.http.get<Team[]>('/api/teams', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
}
