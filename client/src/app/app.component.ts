import { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { WebSocketService } from './services/web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client';

  constructor(private websocketService: WebSocketService, private authService: AuthenticationService) {}

  private subscription: any;

  ngOnInit() {
    // On single page application load, check if already authenticated and connect to websocket
    this.authService.checkForExistingAuthentication();
    this.websocketService.connect();
    this.subscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // If authenticated, authenticate on websocket
        this.websocketService.authenticate(this.authService.getToken());
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe from authenticated observable
    this.subscription.unsubscribe();
  }
}