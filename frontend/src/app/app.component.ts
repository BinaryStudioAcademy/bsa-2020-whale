import { Component } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Contact } from '@shared/models/contact/contact';
import { User } from '@shared/models/user/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'frontend';
  contactCalling: Contact;

  constructor(public fireAuth: AuthService, private http: HttpClient) {}

  closeIncomingCall(): void {
    this.contactCalling = null;
  }
}
