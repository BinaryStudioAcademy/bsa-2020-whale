import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

    refreshTokenInProgress = false;

    tokenRefreshedSource = new Subject();
    tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

    constructor(private injector: Injector, private router: Router, private authService: AuthService) {}

    addAuthHeader(request) {
        const authHeader = this.authService.getAccessToken();
        if (authHeader) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${authHeader}.`
                }
            });
        }
        return request;
    }

    async handleResponseError(error, request?, next?) {
      // Invalid token error
      console.log('test');
      if (error.status === 401) {
        const newToken = await this.authService.refreshToken();
        if (newToken) {
          request = this.addAuthHeader(request);
          return next.handle(request).pipe(catchError(e => {
            if (e.status !== 401) {
                return this.handleResponseError(e);
            } else {
              console.log('logout');
                //this.authService.logout();
            }}));
        }
         /* return this.refreshToken().pipe(
              switchMap(() => {
                  request = this.addAuthHeader(request);
                  return next.handle(request);
              }),
              catchError(e => {
                  if (e.status !== 401) {
                      return this.handleResponseError(e);
                  } else {
                      this.logout();
                  }
              }));
      }*/

      // Access denied error
      

      //return throwError(error);
  }
    }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
      request = this.addAuthHeader(request);

      // Handle response
      return next.handle(request).pipe(catchError(error => {
          return this.handleResponseError(error, request, next);
      }));
  }

  

 /* intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    if (this.authService.isLoggedIn() && token) {
      return next.handle(req.clone({
        headers: req.headers.set('Authentication', `Bearer ${token}`)
      })).pipe(
        tap(
          inext => {
            if (inext instanceof HttpResponse) {
              console.log('Server response', inext);
            }
          },
          async error => {
            console.log('ok?');
            if (error instanceof HttpErrorResponse) {
              if (error.status === 401){
                console.log('okk?');
                const refreshedToken = await this.authService.refreshToken();
                if (refreshedToken) {
                  return  next.handle(req.clone({
                    headers: req.headers.set('Authentication', `Bearer ${refreshedToken}`)
                  }));
              }
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

  private handleUnauthorizedError(subscriber: Subscriber < any >, request: HttpRequest<any>) {

    //запоминаем "401ый" запрос
    this.requests.push({ subscriber, failedRequest: request });
    if(!this.refreshInProgress) {
      //делаем запрос на восстанавливение токена, и установим флаг, дабы следующие "401ые"
      //просто запоминались но не инициировали refresh
      this.refreshInProgress = true;
      this.auth.renewAuth()
        .finally(() => {
          this.refreshInProgress = false;
        })
        .subscribe((authHeader) =>
          //если токен рефрешнут успешно, повторим запросы которые накопились пока мы ждали ответ от рефреша
          this.repeatFailedRequests(authHeader),
          () => {
            //если по каким - то причинам запрос на рефреш не отработал, то делаем логаут
            this.auth.logout();
          });
    }
  }*/
}
