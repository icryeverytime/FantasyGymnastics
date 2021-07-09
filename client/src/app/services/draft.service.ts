import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  startDraft(leagueDocumentID: string) {
    return this.http.post('/api/startDraft', {leagueDocumentID: leagueDocumentID},
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }})
  }
}
