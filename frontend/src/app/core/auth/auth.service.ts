import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root',
  })
export class AuthService {
  private authUser: firebase.User = null;
  private accessToken: string = null;

  public get currentUser(): firebase.User {
    return this.authUser;
  }

  constructor(public fireAuth: AngularFireAuth) {
      fireAuth.authState.subscribe(
        (user) => {
          if (user) {
            this.authUser = user;
            user.getIdToken().then(token => this.accessToken = token);
          }
          else {
            this.authUser = null;
            this.accessToken = null;
          }
        }
      );
  }

  signInWithFacebook(): void {
    this.fireAuth.signInWithPopup(new auth.FacebookAuthProvider());
  }

  signInWithGoogle(): void {
    this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  isLoggedIn(): boolean {
    return this.authUser !== null;
  }

  logout(): void {
    this.fireAuth.signOut();
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  refreshToken(): Promise<string> {
    return this.authUser.getIdToken(true);
  }
}
