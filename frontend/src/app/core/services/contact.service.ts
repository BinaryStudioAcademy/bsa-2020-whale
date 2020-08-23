import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Contact } from '../../shared/models/contact/contact';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  public routePrefix = '/api/contacts';

  constructor(private httpService: HttpService) {}

  public createContactByEmail(
    email: string
  ): Observable<HttpResponse<Contact>> {
    return this.httpService.postFullRequest<void, Contact>(
      `${this.routePrefix}/create?email=${email}`,
      null
    );
  }
  public DeletePendingContact(email: string): void {
    this.httpService
      .deleteRequest<void>(`${this.routePrefix}/email/${email}`)
      .subscribe();
  }
}
