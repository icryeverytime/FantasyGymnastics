import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { League } from '../models/league.model';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  constructor(private authService: AuthenticationService, private http: HttpClient) { }

  /**
   * Send request to get leagues the user is in
   */
  getUserLeagues() {
    return this.http.get<League[]>('/api/userLeagues', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  /**
   * Send request to get the list of publicly available leagues
   */
  getPublicLeagues() {
    return this.http.get<League[]>('/api/publicLeagues', { headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
  
  /**
   * Send request to get more information about the league
   * leagueDocumentID: the league's document id
   */
  getLeague(leagueDocumentID: string) {
    return this.http.post<League>('/api/league', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  /**
   * Send request to create a league
   * name: `some string that will be the league's name`
   * isPublic: `a boolean representing whether the league is publicly available to join`
   * rosterSize: `a number representing the number of gymnasts allowed on each team`
   * eventLineupSize: `a number representing the number of gymnasts to be put on each event`
   * eventCountSize: `a number representing the number of gymnast scores to count on each event`
   */
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

  /**
   * Send request to join a league
   * leagueDocumentID: `some string that is the league document ID`
   */
  requestToJoinLeague(leagueDocumentID: string) {
    return this.http.post('/api/requestToJoin', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  /**
   * Send request to accept request to join league
   * leagueDocumentID: `some string that is the league document ID`
   * email: `some string that is the email of the user to accept into the league`
   */
  acceptRequestToJoinLeague(leagueDocumentID: string, email: string) {
    return this.http.post('/api/acceptRequestToJoin', {
      leagueDocumentID: leagueDocumentID,
      email: email
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  /**
   * Send request to reject request to join league
   * leagueDocumentID: `some string that is the league document ID`
   * email: `some string that is the email of the user to reject from the league`
   */
  declineRequestToJoinLeague(leagueDocumentID: string, email: string) {
    return this.http.post('/api/rejectRequestToJoin', {
      leagueDocumentID: leagueDocumentID,
      email: email
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }

  /** Send request to delete league
   * leagueDocumentID: `some string that is the league document ID`
   */
  deleteLeague(leagueDocumentID: string) {
    return this.http.post('/api/deleteLeague', {
      leagueDocumentID: leagueDocumentID
    },
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }});
  }
}
