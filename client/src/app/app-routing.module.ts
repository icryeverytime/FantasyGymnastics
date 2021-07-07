import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LeaguesComponent } from './components/leagues/leagues.component';
import { LeagueComponent } from './components/league/league.component';
import { LeagueCreateComponent } from './components/league-create/league-create.component';
import { LeagueJoinComponent } from './components/league-join/league-join.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'leagues', component: LeaguesComponent},
  { path: 'leagues/create', component: LeagueCreateComponent},
  { path: 'leagues/join', component: LeagueJoinComponent},
  { path: 'leagues/:leagueDocumentID', component: LeagueComponent},
  { path: '', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
