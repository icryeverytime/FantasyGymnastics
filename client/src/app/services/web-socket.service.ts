import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import * as Rx from 'rxjs';
import { AlertService } from './alert.service';
import { LeagueService } from './league.service';
import { DraftEvent } from '../models/draft-event.model';
import { DraftService } from './draft.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: any;

  websocketAuthenticatedStore = new Rx.ReplaySubject<boolean>(1);
  public websocketAuthenticated$ = this.websocketAuthenticatedStore.asObservable();

  socketIDStore = new Rx.ReplaySubject<string>(1);
  public socketID$ = this.socketIDStore.asObservable();

  constructor(private draftService: DraftService, private alertService: AlertService, private leagueService: LeagueService) {
    this.websocketAuthenticatedStore.next(false);
  }

  // Connect to the websocket
  connect(): Rx.Subject<MessageEvent> {
    this.socket = io('localhost:3000/draft/6111af025719c875be93d922', {
      query: {token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNocmlzQGdtYWlsLmNvbSIsInVzZXJJZCI6IjYwZGU2ZjNkN2NhMWI3NzYxYWE4ODk3ZSIsImV4cCI6MTYyODcyNjYwMSwiaWF0IjoxNjI4NjQwMjAxfQ.aRHPCyo7Geg6v4hSAQVCQzfI3p_OGcIH16W0fQn9K08'}
    });

    this.socket.onmessage = (event: MessageEvent) => {
      this.socket.next(event);
    };

    // Handle a `leagueRequest` message on the socket
    this.socket.on('leagueRequest', (data: any) => {
      // Send an alert to the user
      this.alertService.pushAlert({
        text: data.user + ' has requested to join `' + data.leagueName + '`',
        showAccept: true,
        showDecline: true,
        onAccept: () => {
          // On accept accept the join league request from the other person
          this.leagueService.acceptRequestToJoinLeague(data.leagueID, data.user).subscribe(result => {
            console.log(result);
          });
        },
        onDecline: () => {
          this.leagueService.declineRequestToJoinLeague(data.leagueID, data.user).subscribe(result => {
            console.log(result);
          });
        }
      });
    });

    // Handle a `leagueRejected` message on the socket
    this.socket.on('leagueRejected', (data: any) => {
      // Send an alert to the user
      this.alertService.pushAlert({
        text: 'Your request to join `' + data.leagueName + '` has been declined',
        showAccept: false,
        showDecline: false,
        onAccept: () => {},
        onDecline: () => {}
      });
    });

    // Handle a `leagueAccepted` message on the socket
    this.socket.on('leagueAccepted', (data: any) => {
      // Send an alert to the user
      this.alertService.pushAlert({
        text: 'Your request to join `' + data.leagueName + '` has been accepted',
        showAccept: false,
        showDecline: false,
        onAccept: () => {},
        onDecline: () => {}
      });
    });

    // Handle a `draftStarted` message on the socket
    this.socket.on('draftStarted', (data: any) => {
      // Send an alert to the user
      this.alertService.pushAlert({
        text: 'The draft has started for `' + data.leagueName + '`',
        showAccept: false,
        showDecline: false,
        onAccept: () => {},
        onDecline: () => {}
      });
    });

    return this.socket;
  }

  // Send data to a channel
  send(channel: string, data: any) {
    this.socket.emit(channel, data);
  }
}
