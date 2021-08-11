import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  name: string = '';
  isAuthenticated: boolean = false;
  loading: boolean = true;

  constructor(private authService: AuthenticationService, private websocketService: WebSocketService) {
  }

  ngOnInit(): void {
    this.authService.currentName$.subscribe(name => {
      this.name = name;
    });

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      this.loading = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
