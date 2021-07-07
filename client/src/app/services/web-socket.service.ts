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
    this.socket = io('192.168.1.97:3000');
  
    this.socket.onmessage = (event: MessageEvent) => {
      this.socket.next(event);
    };

    this.socket.onclose = () => {
      this.socket.complete();
    };

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

    this.socket.on('logout-response', (data: any) => {
      if(data['message'] == 'LOGGED_OUT') {
        this.websocketAuthenticatedStore.next(false);
      } else if(data['message'] == 'NO_TOKEN_PROVIDED') {
      } else if(data['message'] == 'INVALID_TOKEN') {
      } else {
      }
    });

    this.socket.on('leagueRequest', (data: any) => {
      this.alertService.pushAlert({
        text: data['user'] + ' has requested to join `' + data['leagueName'] + '`',
        onAccept: () => {
          this.leagueService.acceptRequestToJoinLeague(data['leagueID'], data['user']).subscribe(result => {
            console.log(result);
          });
        },
        onDismiss: () => {console.log('denied');}
      });
      console.log(data);
    });

    return this.socket;
  }

  // Send data to a channel
  send(channel: string, data: any) {
    this.socket.emit(channel, data);
  }

  authenticate(token: any) {
    console.log("emitted authenticate");
    this.socket.emit('authenticate', {token: token});
  }

  logout(token: any) {
    this.socket.emit('logout', {token: token});
  }

}
