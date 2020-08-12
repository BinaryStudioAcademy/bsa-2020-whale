import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  inflightAuthRequest = null;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.authService.isSignedIn) {
      return next.handle(req);
    }

    if (!this.inflightAuthRequest) {
      this.inflightAuthRequest = from(this.authService.getToken());
    }
    return this.inflightAuthRequest.pipe(
      switchMap((token: string) => {
        this.inflightAuthRequest = null;
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next.handle(authReq);
      }),
      catchError((error) => {
        if (error.status === 401) {
          if (!this.inflightAuthRequest) {
            this.inflightAuthRequest = from(this.authService.refreshToken());
            if (!this.inflightAuthRequest) {
              return throwError(error);
            }
          }
          return this.inflightAuthRequest.pipe(
            switchMap((newToken: string) => {
              this.inflightAuthRequest = null;
              const authReqRepeat = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(authReqRepeat);
            })
          );
        } else {
          return throwError(error);
        }
      })
    );
  }
}
