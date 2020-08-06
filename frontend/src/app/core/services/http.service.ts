import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public baseUrl: string = environment.apiUrl;
  public headers = new HttpHeaders();

  constructor(private http: HttpClient) { }

  public getHeaders(): HttpHeaders {
    return this.headers;
  }

  public getHeader(key: string): string {
    return this.headers[key];
  }

  public setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  public deleteHeader(key: string): void {
    delete this.headers[key];
  }

  
  // GET
  
  public getRequest<T>(url: string, httpParams?: any): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), { headers: this.getHeaders(), params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getFullRequest<T>(url: string, httpParams?: any): Observable<HttpResponse<T>> {
    console.log(this.buildUrl(url));
    return this.http.get<T>(this.buildUrl(url), { observe: 'response', headers: this.getHeaders(), params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST
  
  public postClearRequest<TRequest, TResponse>(url: string, payload: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(url), payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  public postRequest<TRequest, TResponse>(url: string, payload: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(url), payload, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  public postFullRequest<TRequest, TResponse>(url: string, payload: TRequest): Observable<HttpResponse<TResponse>> {
    return this.http.post<TResponse>(this.buildUrl(url), payload, { headers: this.getHeaders(), observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
  }

  
  // PUT
  
  public putRequest<TRequest, TResponse>(url: string, payload: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(url), payload, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  public putFullRequest<TRequest, TResponse>(url: string, payload: TRequest): Observable<HttpResponse<TResponse>> {
    return this.http.put<TResponse>(this.buildUrl(url), payload, { headers: this.getHeaders(), observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
  }

  
  // DELETE
  
  public deleteRequest<T>(url: string, httpParams?: any): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), { headers: this.getHeaders(), params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteFullRequest<T>(url: string, httpParams?: any): Observable<HttpResponse<T>> {
    return this.http.delete<T>(this.buildUrl(url), { headers: this.getHeaders(), observe: 'response', params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  // HELPERS
  
  public buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return this.baseUrl + url;
  }

  public prepareData<T>(payload: T): string {
      return JSON.stringify(payload);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
