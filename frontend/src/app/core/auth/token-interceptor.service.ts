import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    if (this.authService.isLoggedIn() && token) {
      return next.handle(req.clone({
        headers: req.headers.set('Authentication', `Bearer ${token}`)
      })).pipe(
        tap(
          next => {
            if (next instanceof HttpResponse)
              console.log('Server response', next);
          },
          async error => {
            console.log('ok?');
            if (error instanceof HttpResponse) {
              if (error.status === 401){
                const refreshedToken = await this.authService.refreshToken();
                if (refreshedToken)
                  return  next.handle(req.clone({
                    headers: req.headers.set('Authentication', `Bearer ${refreshedToken}`)
                  }));
              }
              else
                console.log('Error', error);
            }
          }
        )
      );
    }
    else
      return next.handle(req);
  }
}
