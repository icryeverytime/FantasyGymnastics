import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { League } from 'src/app/models/league.model';
import { Team } from 'src/app/models/team.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DraftService } from 'src/app/services/draft.service';
import { LeagueService } from 'src/app/services/league.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css']
})
export class LeagueComponent implements OnInit {

  loading: boolean = true;
  isAuthenticated: boolean = true;
  userEmail: string = '';
  league: any;
  inLeague: boolean = false;
  requestedToJoin: boolean = false;

  constructor(private router: Router, public location: Location, private leagueService: LeagueService, private route: ActivatedRoute, private authService: AuthenticationService, private websocketService: WebSocketService, private draftService: DraftService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let leagueDocumentID = params['leagueDocumentID'];
      this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        this.authService.userEmail$.subscribe(userEmail => {
          this.userEmail = userEmail
        this.isAuthenticated = isAuthenticated;
        if(this.isAuthenticated) {
          this.leagueService.getLeague(leagueDocumentID).subscribe(league => {
            this.league = league;
            this.league.requested.forEach((email: string) => {
              if (email === this.userEmail) {
                this.requestedToJoin = true;
              }
            });
            this.league.teams.forEach((team: Team) => {
              if (team.owner === userEmail) {
                this.inLeague = true;
              }
            });
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      });
    });
    });
  }

  deleteLeague(): void {
    this.leagueService.deleteLeague(this.league._id).subscribe(result => {
      this.router.navigateByUrl('/leagues');
    });
  }

  requestToJoin(): void {
    this.loading = true;
    this.leagueService.requestToJoinLeague(this.league._id).subscribe(result => {
      this.requestedToJoin = true;
      this.loading = false;
    });
    this.websocketService.send('leagueRequest', {});
  }

  acceptRequestToJoin(email: string): void {
    this.leagueService.acceptRequestToJoinLeague(this.league._id, email).subscribe(result => {
      this.leagueService.getLeague(this.league._id).subscribe(league => {
        this.league = league;
      });
    });
  }

  startDraft() {
    this.draftService.startDraft(this.league._id).subscribe(result => {
      console.log(result);
      if(result) {
        this.league.draft.started = true;
      }
    });
  }

}
