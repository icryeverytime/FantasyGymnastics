import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { League } from 'src/app/models/league.model';
import { LeagueService } from 'src/app/services/league.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-leagues',
  templateUrl: './leagues.component.html',
  styleUrls: ['./leagues.component.css']
})
export class LeaguesComponent implements OnInit, OnDestroy {

  constructor(public authService: AuthenticationService, private leagueService: LeagueService) { }

  name: string = '';
  leagues?: League[];
  loading: boolean = true;
  isAuthenticated: boolean = false;
  isAuthenticatedSubscription: any;
  currentNameSubscription: any;
  getLeaguesSubscription: any;

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    console.log('visited');
    this.currentNameSubscription = this.authService.currentName$.subscribe(name => {
      this.name = name;
    });

    this.authService.isAuthenticated$.pipe(takeUntil(this.unsubscribe$)).subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      console.log("league component got", this.isAuthenticated)
      if(this.isAuthenticated) {
        this.getLeaguesSubscription = this.leagueService.getUserLeagues().subscribe(leagues => {
          this.leagues = leagues;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    console.log('leagues component destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.currentNameSubscription.unsubscribe();
    if(this.getLeaguesSubscription)
      this.getLeaguesSubscription.unsubscribe();
  }

}
