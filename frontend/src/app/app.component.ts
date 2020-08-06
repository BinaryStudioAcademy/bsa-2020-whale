import { Component } from '@angular/core';
import { WebrtcSignalService, SignalData } from './core/services/webrtc-signal.service'
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
  sendHttp() {
    this.http.get('http://localhost:51569/weatherforecast').subscribe(r => console.log(r));
  }

}
