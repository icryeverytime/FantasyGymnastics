import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-league-create',
  templateUrl: './league-create.component.html',
  styleUrls: ['./league-create.component.css']
})
export class LeagueCreateComponent implements OnInit {

  constructor(private leagueService: LeagueService, private router: Router) { }

  loading: boolean = false;

  ngOnInit(): void {
  }
  
  createLeague(name: string, rosterSize: string, eventLineupSize: string, eventCountSize: string, isPublic: boolean) {
    this.loading = true;
    this.leagueService.createLeague(name, parseInt(rosterSize), parseInt(eventLineupSize), parseInt(eventCountSize), isPublic).subscribe(league => {
      this.loading = false;
      this.router.navigateByUrl('/leagues/' + league._id);
    });
  }

}
