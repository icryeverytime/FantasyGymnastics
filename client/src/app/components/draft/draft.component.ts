import { Component, OnDestroy, OnInit } from '@angular/core';
import { GymnastService } from 'src/app/services/gymnast.service';
import { Gymnast } from 'src/app/models/gymnast.model';
import { Observable } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { ActivatedRoute } from '@angular/router';
import { League } from 'src/app/models/league.model';
import { io } from 'socket.io-client';
import * as Rx from 'rxjs';
import { Team } from 'src/app/models/team.model';
import { DraftService } from 'src/app/services/draft.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DraftEvent, DraftEventType, GymnastDraftedEvent } from 'src/app/models/draft-event.model';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit, OnDestroy {

  constructor(private authenticationService: AuthenticationService, private websocketService: WebSocketService, private route: ActivatedRoute, private gymnastService: GymnastService, private leagueService: LeagueService, private draftService: DraftService) { }

  gymnasts: Gymnast[] = [];
  filteredGymnasts: Gymnast[] = [];
  subscription: any;
  loading: boolean = true;
  league: any;
  leagueDocumentID: string = '';
  sid: string = '';
  socket: any;
  draftComplete: boolean = false;
  notMyTurn: boolean = false;

  sortedByNameAscending: boolean = false;
  sortedByTeamAscending: boolean = false;
  sortedByYearAscending: boolean = false;

  YEARS = new Map<string, number>([
    ['FR', 1],
    ['SO', 2],
    ['JR', 3],
    ['SR', 4],
  ]);

  ngOnInit(): void {
    this.leagueDocumentID = this.route.snapshot.params['leagueDocumentID'];
    this.connectToWebsocket(this.leagueDocumentID);

    // Get the league
    const promise1 = this.leagueService.getLeague(this.leagueDocumentID).toPromise().then((league: League) => {
      this.league = league;
    }).catch(error => {
      console.log(error)
    });

    // Get all gymnasts
    const promise2 = this.gymnastService.getAllGymnasts().toPromise().then(gymnasts => {
      this.gymnasts = gymnasts;
      this.filteredGymnasts = this.gymnasts;
    }).catch(error => {
      console.log(error)
    });

    // Once the WebSocket connection is made and the gymnasts and league are loaded, show the apge
    Promise.all([promise1, promise2]).then(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.socket.disconnect();
  }

  connectToWebsocket(leagueDocumentID: string) {
    let token = this.authenticationService.getToken();
    this.socket = io('localhost:3000/draft/' + leagueDocumentID, {
      query: {
        token: token
      }
    });

    this.socket.onmessage = (event: MessageEvent) => {
      this.socket.next(event);
    };

    this.socket.on('draftEvent', (event: DraftEvent) => {
      if (event.type == DraftEventType.GYMNAST_DRAFTED) {
        let gymnastDraftEvent = event as GymnastDraftedEvent;
        this.filteredGymnasts = this.filteredGymnasts.filter((gymnast: Gymnast) => {
          return gymnast._id != gymnastDraftEvent.data.gymnastID;
        });
        this.gymnasts = this.gymnasts.filter((gymnast: Gymnast) => {
          return gymnast._id != gymnastDraftEvent.data.gymnastID;
        });
      } else if(event.type == DraftEventType.DRAFT_COMPLETE) {
        alert('Draft complete');
      }
    });

    return this.socket;
  }

  draft(gymnastDocumentID: string) {
    this.draftService.draftGymnast(this.leagueDocumentID, gymnastDocumentID).subscribe((result) => {
      console.log(result);
    });
  }

  /** Functions for sorting and searching gymnast table */
  onChangeEvent(event: any) {
    if(event.target.value == '') {
      this.filteredGymnasts = this.gymnasts;
    } else {
      this.filteredGymnasts = this.gymnasts.filter(gymnast => {
        return gymnast.name.toLowerCase().startsWith(event.target.value.toLowerCase()) ||
          gymnast.team.toLowerCase().startsWith(event.target.value.toLowerCase());
      });
    }
  }

  sortByName() {
    this.sortedByTeamAscending = false;
    this.sortedByYearAscending = false;
    if (this.sortedByNameAscending) {
      this.sortedByNameAscending = false;
      this.gymnasts.sort((a, b) => {
        if (a.name > b.name) {
          return -1;
        } else if (a.name < b.name) {
          return 1;
        } else {
          return 0;
        }
      });
    } else {
      this.sortedByNameAscending = true;
      this.gymnasts.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  sortByTeam() {
    this.sortedByNameAscending = false;
    this.sortedByYearAscending = false;
    if (this.sortedByTeamAscending) {
      this.sortedByTeamAscending = false;
      this.gymnasts.sort((a, b) => {
        if (a.team > b.team) {
          return -1;
        } else if (a.team < b.team) {
          return 1;
        } else {
          return 0;
        }
      });
    } else {
      this.sortedByTeamAscending = true;
      this.gymnasts.sort((a, b) => {
        if (a.team < b.team) {
          return -1;
        } else if (a.team > b.team) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  sortByYear() {
    this.sortedByNameAscending = false;
    this.sortedByTeamAscending = false;
    if (this.sortedByYearAscending) {
      this.sortedByYearAscending = false;
      this.gymnasts.sort((a, b) => {
        if ((this.YEARS.get(a.year) ?? 0) > (this.YEARS.get(b.year) ?? 0)) {
          return -1;
        }
        if ((this.YEARS.get(a.year) ?? 0) < (this.YEARS.get(b.year) ?? 0)) {
          return 1;
        }
        return 0;
      });
    } else {
      this.sortedByYearAscending = true;
      this.gymnasts.sort((a, b) => {
        if ((this.YEARS.get(a.year) ?? 0) < (this.YEARS.get(b.year) ?? 0)) {
          return -1;
        }
        if ((this.YEARS.get(a.year) ?? 0) > (this.YEARS.get(b.year) ?? 0)) {
          return 1;
        }
        return 0;
      });
    }
  }

}
