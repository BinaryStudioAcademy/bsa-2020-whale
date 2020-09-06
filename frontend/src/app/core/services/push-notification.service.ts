import {
  Injectable
} from '@angular/core';
import {PushNotification} from '../../shared/models/notification/push-notification';
import {Observable} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  public permission: Permission;
  constructor() {
    this.permission = this.isSupported() ? 'default' : 'denied';
  }
  public isSupported(): boolean {
    return 'Notification' in window;
  }
  requestPermission(): void {
    const self = this;
    if ('Notification' in window) {
      Notification.requestPermission((status) => {
        return self.permission = status;
      });
    }
  }
  create(title: string, options?: PushNotification): any {

    return new Observable((obs: any) => {

      if (!('Notification' in window)) {
        obs.error('Notifications are not available in this environment');
        obs.complete();
      }

      if (this.permission !== 'granted') {
        obs.error(`The user hasn't granted you permission to send push notifications`);
        obs.complete();
      }

      const n = new Notification(title, options);

      n.onshow = (e: any) => obs.next({notification: n, event: e});
      n.onclick = (e: any) => obs.next({notification: n, event: e});
      n.onerror = (e: any) => obs.error({notification: n, event: e});
      n.onclose = () => obs.complete();
    });
  }
  Send(body: string): void {
      const options = {
        body,
        icon: 'https://img.icons8.com/flat_round/64/000000/whale--v1.png'
      };
      this.create('Whale', options).subscribe((res) => {}, (err) => err);
  }

  SendAsObservable(body: string ): Observable<any> {
    const options = {
      body,
      icon: 'https://img.icons8.com/flat_round/64/000000/whale--v1.png'
    };
    return this.create('Whale', options);
  }
}
export declare type Permission = 'denied' | 'granted' | 'default';
