import { Injectable } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private authService: AuthService) {}

  public get userUid(): Observable<string> {
    return this.authService.user$.pipe(mergeMap((user) => user.uid));
  }

  public get userName(): Observable<string> {
    return this.authService.user$.pipe(mergeMap((user) => user.displayName));
  }

  public get userEmail(): Observable<string> {
    return this.authService.user$.pipe(mergeMap((user) => user.email));
  }

  public get userPhoto(): Observable<string> {
    return this.authService.user$.pipe(mergeMap((user) => user.photoURL));
  }
}
