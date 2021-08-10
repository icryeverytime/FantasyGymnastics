import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DraftEvent, DraftEventType, UserJoinedDraftEvent } from '../models/draft-event.model';
import { AuthenticationService } from './authentication.service';
import { WebSocketService } from './web-socket.service';

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

  joinDraftRoom(leagueDocumentID: string) {
    return this.http.post('/api/joinDraftRoom', {leagueDocumentID: leagueDocumentID},
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }})
  }

  handleDraftEvent(draftEvent: DraftEvent) {
    if (draftEvent.type == DraftEventType.USER_JOINED) {
      let userDraftEvent = draftEvent as UserJoinedDraftEvent;
      console.log("Draft event", userDraftEvent.data.userEmail + " has joined");
    }
  }
}
