import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserRegistrationService } from '../services/user-registration.service';
import { Observable, of, from } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

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
    this.user$ = fireAuth.authState;
    this.user$.subscribe((user) => {
      if (user) {
        this.isSignedIn = true;
        this.currentUser = user;
        this.registrationService.registerUser(user);
      } else {
        this.isSignedIn = false;
        this.currentUser = null;
      }
      return of(user);
    });
  }

  public async signInWithFacebook(): Promise<boolean> {
    return (
      (await this.fireAuth.signInWithPopup(new auth.FacebookAuthProvider())) !==
      null
    );
  }

  public async signInWithGoogle(): Promise<boolean> {
    return (
      (await this.fireAuth.signInWithPopup(new auth.GoogleAuthProvider())) !==
      null
    );
  }

  public logout(): Observable<void> {
    return from(this.fireAuth.signOut());
  }

  public getToken(): Observable<string> {
    return this.fireAuth.idToken;
  }

  public refreshToken(): Observable<string> {
    return this.user$.pipe(
      filter((user) => Boolean(user)),
      mergeMap(async (user) => await user.getIdToken(true))
    );
  }
}
