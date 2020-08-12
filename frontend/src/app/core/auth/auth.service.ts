import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserRegistrationService } from '../services/user-registration.service';
import { Observable } from 'rxjs';

declare var gapi: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUser: firebase.User = null;
  public user$: Observable<firebase.User>;

  public get currentUser(): firebase.User {
    return this.authUser;
  }

  constructor(
    private fireAuth: AngularFireAuth,
    private registrationService: UserRegistrationService
  ) {
    fireAuth.authState.subscribe((user) => {
      if (user) {
        this.authUser = user;
        this.registrationService.registerUser(user);
      } else {
        this.authUser = null;
      }
    });

    this.initClient();
    this.user$ = fireAuth.authState;
  }

  // Initialize the Google API client with desired scopes
  initClient() {
    gapi.load('client', () => {
      console.log('loaded client');

      // It's OK to expose these credentials, they are client safe.
      gapi.client.init({
        apiKey: 'AIzaSyCOuwbwANkbbZT5hSpwpIDvXdZuce9fhZc', // * <- api key from firebase
        clientId:
          '456439221439-70lmrohq9fr01b534qdj3cunid377b89.apps.googleusercontent.com', // * <= google clientId
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

  public isLoggedIn(): boolean {
    return this.authUser !== null;
  }

  public logout(): Promise<void> {
    return this.fireAuth.signOut();
  }

  public getToken(): Promise<string> {
    return this.authUser?.getIdToken();
  }

  public refreshToken(): Promise<string> {
    return this.authUser?.getIdToken(true);
  }
}
