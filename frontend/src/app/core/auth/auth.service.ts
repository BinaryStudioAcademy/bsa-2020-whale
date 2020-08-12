import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserRegistrationService } from '../services/user-registration.service';
import { Observable, of, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '@env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser: firebase.User;
  public user$: Observable<firebase.User>;
  public isSignedIn: boolean = false;

  constructor(
    private fireAuth: AngularFireAuth,
    private registrationService: UserRegistrationService
  ) {
    this.initClient();
    this.user$ = fireAuth.authState;
    this.user$.subscribe((user) => {
      if (user) {
        this.registrationService.registerUser(user);
        this.currentUser = user;
        this.isSignedIn = true;
      } else {
        this.isSignedIn = false;
        this.currentUser = null;
      }
      return of(user);
    });
  }

  // Initialize the Google API client with desired scopes
  initClient() {
    gapi.load('client', () => {
      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: environment.firebase.apiKey, // * <- api key from firebase
        clientId:
          '893944865679-eav20gfr3sbintikhq42dhhc414loq4p.apps.googleusercontent.com', // * <= google clientId
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        ],
        scope: 'https://www.googleapis.com/auth/calendar',
      });

      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));
    });
  }

  public async signInWithFacebook(): Promise<boolean> {
    return (
      (await this.fireAuth.signInWithPopup(new auth.FacebookAuthProvider())) !==
      null
    );
  }

  public async signInWithGoogle(): Promise<boolean> {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();

    const token = googleUser.getAuthResponse().id_token;

    console.log(googleUser);

    const credential = auth.GoogleAuthProvider.credential(token);

    return (
      (await this.fireAuth.signInAndRetrieveDataWithCredential(credential)) !==
      null
    );

    //return await this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider()) !== null;
  }

  public logout(): Observable<void> {
    return from(this.fireAuth.signOut());
  }

  public getToken(): Observable<string> {
    return this.fireAuth.idToken;
  }

  public refreshToken(): Observable<string> {
    return this.user$.pipe(
      mergeMap(async (user) => await user.getIdToken(true))
    );
  }
}
