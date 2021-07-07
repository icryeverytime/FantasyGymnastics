import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthenticationService, private router: Router) { }

  formError: string = '';

  ngOnInit(): void {
  }

  register(email: string, name: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      this.formError = 'Passwords do not match';
    } else {
      this.authService.register(email, name, password).subscribe(result => {
        console.log(result);
      });
    }
  }

}
