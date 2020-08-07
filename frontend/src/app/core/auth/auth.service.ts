import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserRegistrationService } from '../services/user-registration.service';

@Injectable({
    providedIn: 'root',
  })
export class AuthService {
  private authUser: firebase.User = null;

  public get currentUser(): firebase.User {
    return this.authUser;
  }

  constructor(
    private fireAuth: AngularFireAuth,
    private registrationService: UserRegistrationService
    ) {
      fireAuth.authState.subscribe(
        (user) => {
          if (user) {
            this.authUser = user;
            this.registrationService.registerUser(user);
          }
          else {
            this.authUser = null;
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

  public getToken(): Promise<string> {
    return this.authUser?.getIdToken();
  }

  public refreshToken(): Promise<string> {
    return this.authUser?.getIdToken(true);
  }
}
