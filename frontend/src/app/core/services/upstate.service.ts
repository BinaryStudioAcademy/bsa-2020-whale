import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { User } from '../../shared/models/user/user';
import { Subject, from, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UpstateService {
  public routePrefix = '/api/user/email';
  public loggedInUser: User;

  private signalUserConected = new Subject<User>();
  public signalUserConected$ = this.signalUserConected.asObservable();

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}
  public getLoggedInUser(): Observable<User> {
    return this.authService.user$.pipe(
      filter((user) => Boolean(user)),
      switchMap((user) =>
        this.httpService.getRequest<User>(`${this.routePrefix}/${user.email}`)
      )
    );
  }
}
