import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root',
  })
export class AuthService {
  private authUser: firebase.User = null;

  public get currentUser(): firebase.User {
    return this.authUser;
  }

  constructor(public fireAuth: AngularFireAuth) {
      fireAuth.authState.subscribe(
        (user) => {
          if (user) {
            this.authUser = user;
          }
          else {
            this.authUser = null;
          }
        }
      );
  }

  public signInWithFacebook(): void {
    this.fireAuth.signInWithPopup(new auth.FacebookAuthProvider());
  }

  public signInWithGoogle(): void {
    this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  public isLoggedIn(): boolean {
    return this.authUser !== null;
  }

  public logout(): void {
    this.fireAuth.signOut();
  }

  public getAccessToken(refresh: boolean = false): Promise<string> {
    return this.authUser?.getIdToken(refresh);
  }

  public refreshToken(): Promise<string> {
    return this.getAccessToken(true);
  }
}
