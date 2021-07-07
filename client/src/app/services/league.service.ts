import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { League } from '../models/league.model';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  constructor(private authService: AuthenticationService, private http: HttpClient) { }

  getUserLeagues() {
    return this.http.get<League[]>('/api/userLeagues', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  getPublicLeagues() {
    return this.http.get<League[]>('/api/publicLeagues', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
  
  getLeague(leagueDocumentID: string) {
    return this.http.post<League>('/api/league', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  createLeague(name: string, rosterSize: number, eventCountSize: number, eventLineupSize: number, isPublic: boolean) {
    return this.http.post<League>('/api/createLeague',{
      name: name,
      rosterSize: rosterSize,
      eventCountSize: eventCountSize,
      eventLineupSize: eventLineupSize,
      public: isPublic
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  requestToJoinLeague(leagueDocumentID: string) {
    return this.http.post('/api/requestToJoin', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  acceptRequestToJoinLeague(leagueDocumentID: string, email: string) {
    return this.http.post('/api/acceptRequestToJoin', {
      leagueDocumentID: leagueDocumentID,
      email: email
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  deleteLeague(leagueDocumentID: string) {
    return this.http.post('/api/deleteLeague', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
}
