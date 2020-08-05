import { Component } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'frontend';
  constructor(
    public fireAuth: AuthService,
    private http: HttpClient
    )
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
    console.log(this.fireAuth.getAccessToken());
  }
  testLogIn()
  {
    console.log('li');
    console.log(this.fireAuth.isLoggedIn());
  }
  testRefresh()
  {
    console.log('r');
    this.fireAuth.refreshToken().then(rr => console.log(rr));
  }
  sendHttp() {
    this.http.get('http://localhost:51569/weatherforecast').subscribe(r => console.log(r));
  }


}
