import { Component, OnInit} from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';


@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.sass']
})
export class LandingPageComponent implements OnInit {
  public showLogIn = false;
  public logInButtonText = 'Log In';
  constructor(public auth: AuthService) {
  }

  ngOnInit(): void {

  }

  public logIn(): void {
    this.showLogIn = !this.showLogIn;
    this.logInButtonText = this.showLogIn ? 'Close' : 'Log In';
  }

  public logOut(): void {
    this.auth.logout();
  }

  public onLogin(success: boolean): void
  {
    this.logIn();
  }
}
