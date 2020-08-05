import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root',
  })
export class AuthService {
  private authUser: firebase.User = null;
  private cachedToken: string = null;

  constructor(private fireAuth: AngularFireAuth) {
      fireAuth.authState.subscribe(
        (user) => {
          if (user) {
            this.authUser = user;
            user.getIdToken().then(token => this.cachedToken = token);
          }
          else {
            this.authUser = null;
            this.cachedToken = null;
          }
        }
      );
  }

  public async signInWithFacebook(): Promise<boolean>{
    return await this.fireAuth.signInWithPopup(new auth.FacebookAuthProvider()) !== null;
  }

  public async  signInWithGoogle(): Promise<boolean> {
    return await this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider()) !== null;
  }

  public isLoggedIn(): boolean {
    return this.authUser !== null;
  }

  public logout(): Promise<void> {
    return this.fireAuth.signOut();
  }
  public getAccessToken(): string {
    return this.cachedToken;
  }

  public async refreshToken(refresh: boolean = true): Promise<string> {
    const token = await this.authUser?.getIdToken(refresh);
    return this.cachedToken = token;
  }
}
