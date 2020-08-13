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
  contactCalling: Contact = {
    id: '0e16c40a-d42b-4e66-2d6e-08d83eb3b07b',
    firstMemberId: '56df0675-f6c7-4c17-bb28-50481384ebc9',
    firstMember: {
      id: '56df0675-f6c7-4c17-bb28-50481384ebc9',
      firstName: 'Ostap',
      secondName: 'Kernytskiy',
      registrationDate: new Date('2020-08-12T14:27:46.0621966'),
      avatarUrl:
        'https://lh6.googleusercontent.com/-yZ5EDv8OtLo/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclVZbHQRQI-5BWWPq5rfmPvlMtqCg/photo.jpg',
      email: 'okernytskiy@gmail.com',
      phone: '',
    } as User,
    secondMemberId: '05b89827-4b8d-42c8-b712-3c71caadf2aa',
    secondMember: {
      id: '05b89827-4b8d-42c8-b712-3c71caadf2aa',
      firstName: 'Остап',
      secondName: 'Керницький',
      registrationDate: new Date('2020-08-12T14:28:43.7816952'),
      avatarUrl:
        'https://lh4.googleusercontent.com/-gCFsFc_HzV4/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckTNLiU5VHcQjH1kgi6wAAmDDc5dg/photo.jpg',
      email: 'ostap.kernytskyi.pz.2017@lpnu.ua',
      phone: null,
    } as User,
    pinnedMessage: null,
    settings: {
      isBloked: false,
      isMuted: false,
    },
    contactnerSettings: {
      isBloked: false,
      isMuted: false,
    },
  };

  constructor(public fireAuth: AuthService, private http: HttpClient) {}

  closeAnswerCall(): void {
    this.contactCalling = null;
  }
}
