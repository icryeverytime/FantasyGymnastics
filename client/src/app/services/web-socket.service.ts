import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import * as Rx from 'rxjs';
import { AlertService } from './alert.service';
import { LeagueService } from './league.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: any;

  websocketAuthenticatedStore = new Rx.ReplaySubject<boolean>(1);
  public websocketAuthenticated$ = this.websocketAuthenticatedStore.asObservable();

  constructor(private alertService: AlertService, private leagueService: LeagueService) {
    this.websocketAuthenticatedStore.next(false);
  }

  // Connect to the websocket
  connect(): Rx.Subject<MessageEvent> {
    this.socket = io('localhost:3000');
  
    this.socket.onmessage = (event: MessageEvent) => {
      this.socket.next(event);
    };

    this.socket.onclose = () => {
      this.socket.complete();
    };

    // Handle an `authenticate-response` message on the socket
    this.socket.on('authenticate-response', (data: any) => {
      if(data['message'] == 'AUTHENTICATED') {
        this.websocketAuthenticatedStore.next(true);
      } else if(data['message'] == 'NO_TOKEN_PROVIDED') {
        this.websocketAuthenticatedStore.next(false);
      } else if(data['message'] == 'INVALID_TOKEN') {
        this.websocketAuthenticatedStore.next(false);
      } else {
        this.websocketAuthenticatedStore.next(false);
      }
    });

    // Handle a `logout-response` message on the socket
    this.socket.on('logout-response', (data: any) => {
      if(data['message'] == 'LOGGED_OUT') {
        this.websocketAuthenticatedStore.next(false);
      } else if(data['message'] == 'NO_TOKEN_PROVIDED') {
      } else if(data['message'] == 'INVALID_TOKEN') {
      } else {
      }
    });

    // Handle a `leagueRequest` message on the socket
    this.socket.on('leagueRequest', (data: any) => {
      // Send an alert to the user
      this.alertService.pushAlert({
        text: data['user'] + ' has requested to join `' + data['leagueName'] + '`',
        onAccept: () => {
          // On accept accept the join league request from the other person
          this.leagueService.acceptRequestToJoinLeague(data['leagueID'], data['user']).subscribe(result => {
            console.log(result);
          });
        },
        onDismiss: () => {console.log('denied');}
      });
    });

    return this.socket;
  }

  // Send data to a channel
  send(channel: string, data: any) {
    this.socket.emit(channel, data);
  }

  // Send authenticate on websocket
  authenticate(token: any) {
    this.socket.emit('authenticate', {token: token});
  }

  // Send logout on websocket
  logout(token: any) {
    this.socket.emit('logout', {token: token});
  }

}
