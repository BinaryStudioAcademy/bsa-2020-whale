import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { Notification } from '@shared/models/notification/notification'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public routePrefix = '/api/notifications';

  constructor(private httpService: HttpService) {}

  public GetNotifications(): Observable<Notification[]> {
    return this.httpService.getRequest<Notification[]>(this.routePrefix);
  }
  public DeleteNotification(id: string): void {
    this.httpService.deleteRequest<void>(`${this.routePrefix}/${id}`).subscribe();
  }
}
