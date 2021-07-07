import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  rootURL: string = '/api';
  token: string = '';
  expiration: number = 0;
  authenticated: boolean = false;
  
  private currentNameStore = new BehaviorSubject<string>('');
  private userEmailStore = new BehaviorSubject<string>('');
  private isAuthenticatedStore = new ReplaySubject<boolean>(1);

  public currentName$ = this.currentNameStore.asObservable();
  public isAuthenticated$ = this.isAuthenticatedStore.asObservable();
  public userEmail$ = this.userEmailStore.asObservable();

  constructor(private http: HttpClient) {}

  setCurrentName(name: string) {
    this.currentNameStore.next(name);
  }

  setIsAuthenticated(isAuthenticated: boolean) {
    console.log("auth service set authenticated");
    this.isAuthenticatedStore.next(isAuthenticated);
  }

  setUserEmail(email: string) {
    this.userEmailStore.next(email);
  }

  checkForExistingAuthentication() {
    let token = window.localStorage.getItem("token");
    let expiration = window.localStorage.getItem("expiration");
    if(token !== null && expiration !== null) {
      let currentTime = Math.ceil((new Date().getTime() / 1000));
      if(parseInt(expiration) > currentTime) {
        // If token has not expired yet, use it
        this.setToken(token, parseInt(expiration));
        this.getUserProfile().subscribe(user => {
          this.setCurrentName(user.name);
          this.setUserEmail(user.email);
          this.setIsAuthenticated(true);
        });
      } else {
        console.log("Existing token found but expired")
        this.setIsAuthenticated(false);
      }
    } else {
      console.log("Existing token not found")
      this.setIsAuthenticated(false);
    }
  }

  setToken(token: string, exp: number) {
    this.token = token;
    this.expiration = exp;
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("expiration", this.expiration.toString());
  }
  
  getToken(): string {
    return this.token;
  }

  getUserProfile() {
    return this.http.get<User>(this.rootURL + '/profile', { headers: {
      'Authorization': 'Bearer ' + this.token
    }});
  }

  login(email: string, password: string) {
    return this.http.post(this.rootURL + '/login', {
      email: email,
      password: password
    }, {responseType: 'text'});
  }

  register(email: string, name: string, password: string) {
    return this.http.post(this.rootURL + '/register', {
      email: email,
      name: name,
      password: password
    });
  }

  logout() {
    this.token = "";
    this.expiration = 0;
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("expiration");
    this.setIsAuthenticated(false);
  }
}
