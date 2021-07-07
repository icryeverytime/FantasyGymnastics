import { Component, OnInit } from '@angular/core';
import { League } from 'src/app/models/league.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-league-join',
  templateUrl: './league-join.component.html',
  styleUrls: ['./league-join.component.css']
})
export class LeagueJoinComponent implements OnInit {

  constructor(private authService: AuthenticationService, private leagueService: LeagueService) { }

  isAuthenticated: boolean = false;
  loading: boolean = true;
  leagues?: League[];

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      if(this.isAuthenticated) {
        this.leagueService.getPublicLeagues().subscribe(leagues => {
          this.leagues = leagues;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

}
