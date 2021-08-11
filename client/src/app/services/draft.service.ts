import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DraftEvent, DraftEventType, UserJoinedDraftEvent, UserLeftDraftEvent, GymnastDraftedEvent } from '../models/draft-event.model';
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

  draftGymnast(leagueDocumentID: string, gymnastDocumentID: string) {
    return this.http.post('/api/draftGymnast', {leagueDocumentID: leagueDocumentID, gymnastDocumentID: gymnastDocumentID},
    {headers: {
      'Authorization': 'Bearer ' + this.authService.getToken()
    }})
  }

  handleDraftEvent(draftEvent: DraftEvent) {
    if (draftEvent.type == DraftEventType.USER_JOINED) {
      let userDraftEvent = draftEvent as UserJoinedDraftEvent;
      console.log("Draft event", userDraftEvent.data.userEmail + " has joined");
    } else if(draftEvent.type == DraftEventType.USER_LEFT) {
      let userDraftEvent = draftEvent as UserLeftDraftEvent;
      console.log("Draft event", userDraftEvent.data.userEmail + " has left");
    }
  }
}
