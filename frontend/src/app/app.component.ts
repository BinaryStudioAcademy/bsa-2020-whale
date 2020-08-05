import { Component } from '@angular/core';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'frontend';
  constructor(public fireAuth: AuthService)
  {}

/// REMOVE BEFORE MARGE
  testlogGoogle()
  {
    console.log('g');
    this.fireAuth.signInWithGoogle();
  }
  testlogFacebook()
  {
    console.log('f');
    this.fireAuth.signInWithFacebook();
  }
  testLogOut()
  {
    console.log('l');
    this.fireAuth.logout();
  }
  testGet()
  {
    console.log('g');
    this.fireAuth.getAccessToken().then(c => console.log(c));
  }
  testLogIn()
  {
    console.log('li');
    console.log(this.fireAuth.isLoggedIn());
  }
  testRefresh()
  {
    console.log('r');
    console.log(this.fireAuth.refreshToken());
  }
}
