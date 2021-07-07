import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TeamService } from 'src/app/services/team.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, public authService: AuthenticationService, private teamService: TeamService, private websocketService: WebSocketService) { }

  formError: string = '';
  loginLoading: boolean = false;

  ngOnInit(): void {
  }

  login(email: string, password: string) {
    this.loginLoading = true;
    this.authService.login(email, password).subscribe(result => {
      let json = JSON.parse(result);
      if (json['token']) {
        this.authService.setToken(json['token'], json['exp']);
        this.authService.getUserProfile().subscribe(user => {
          this.authService.setCurrentName(user.name);
          this.authService.setUserEmail(user.email);
          this.authService.setIsAuthenticated(true);
          this.router.navigateByUrl('');
        });
      } else {
        this.formError = 'Invalid email or password';
      }
      this.loginLoading = false;
    });
  }

}
