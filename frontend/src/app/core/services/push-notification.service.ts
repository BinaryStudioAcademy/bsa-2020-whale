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
  create(title: string, options ? : PushNotification): any {
    const self = this;
    return new Observable((obs) => {
      if (!('Notification' in window)) {
        console.log('Notifications are not available in this environment');
        obs.complete();
      }
      if (self.permission !== 'granted') {
        console.log("The user hasn't granted you permission to send push notifications");
        obs.complete();
      }
      let _notify = new Notification(title, options);
      _notify.onshow = (e) => {
        return obs.next({
          notification: _notify,
          event: e
        });
      };
      _notify.onclick = (e) => {
        return obs.next({
          notification: _notify,
          event: e
        });
      };
      _notify.onerror = (e) => {
        return obs.error({
          notification: _notify,
          event: e
        });
      };
      _notify.onclose = () => {
        return obs.complete();
      };
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
