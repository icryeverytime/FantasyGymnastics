import { Component, OnDestroy, OnInit } from '@angular/core';
import { GymnastService } from 'src/app/services/gymnast.service';
import { Gymnast } from 'src/app/models/gymnast.model';
import { Observable } from 'rxjs';
import { LeagueService } from 'src/app/services/league.service';
import { ActivatedRoute } from '@angular/router';
import { League } from 'src/app/models/league.model';
import { Team } from 'src/app/models/team.model';
import { DraftService } from 'src/app/services/draft.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private gymnastService: GymnastService, private leagueService: LeagueService, private draftService: DraftService) { }

  gymnasts: Gymnast[] = [];
  filteredGymnasts: Gymnast[] = [];
  subscription: any;
  loading: boolean = true;
  league: any;
  alreadyDrafted: string[] = [];

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
    this.route.params.subscribe(params => {
      let leagueDocumentID = params['leagueDocumentID'];
      this.draftService.joinDraftRoom(leagueDocumentID).subscribe(result => {
        console.log(result);
      });
      this.subscription = this.gymnastService.getAllGymnasts().subscribe(gymnasts => {
        this.leagueService.getLeague(leagueDocumentID).subscribe(league => {
          this.league = league;
          this.gymnasts = gymnasts;
          this.filteredGymnasts = gymnasts;
          this.league.teams.forEach((team: Team) => {
            team.gymnastIDs.forEach((gymnastDocumentID: string) => {
              this.alreadyDrafted.push(gymnastDocumentID);
            });
          });

          this.loading = false;
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  draft(gymnastDocumentID: string) {
    console.log(gymnastDocumentID);
  }

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
