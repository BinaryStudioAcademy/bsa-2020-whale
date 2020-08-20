import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Notification } from 'app/shared/models/notification/notification';
import { User } from '@shared/models/user';
import { HttpService } from '../../../core/services/http.service';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { BlobService } from '../../../core/services/blob.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { UpstateService } from '../../../core/services/upstate.service';
import { NotificationService } from 'app/core/services/notification.service';
import { HubConnection } from '@aspnet/signalr';
import { Subject, from } from 'rxjs';
import { SignalRService } from 'app/core/services/signal-r.service';
import { environment } from '@env';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  private hubConnection: HubConnection;
  public isUserLoadig = true;
  public isNotificationsLoading = true;
  private receivedNotify = new Subject<Notification>();
  public receivedNotify$ = this.receivedNotify.asObservable();
  private unsubscribe$ = new Subject<void>();

  settingsMenuVisible = false;
  isNotificationsVisible = false;
  loggedInUser: User;

  public notificationsList: Notification[];

  constructor(
    private router: Router,
    public auth: AuthService,
    private httpService: HttpService,
    private blobService: BlobService,
    private upstateService: UpstateService,
    private notificationService: NotificationService,
    private signalRService: SignalRService,
  ) {}

  public showNotificationsMenu(): void {
    if (this.settingsMenuVisible) {
      this.settingsMenuVisible = false;
    }

    this.isNotificationsVisible = !this.isNotificationsVisible;
  }

  public showSettingsMenu(): void {
    if (this.isNotificationsVisible) {
      this.isNotificationsVisible = false;
    }

    this.settingsMenuVisible = !this.settingsMenuVisible;
  }

  ngOnInit(): void {
    this.getUser();
    this.getNotifications();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getUser(): void {
    this.upstateService
      .getLoggedInUser()
      .pipe(tap(() => (this.isUserLoadig = false)))
      .subscribe((userFromDB: User) => {
        this.loggedInUser = userFromDB;
        this.subscribeNotifications();
      });
  }
  getNotifications(): void {
    this.notificationService.GetNotifications()
      .pipe(tap(() => (this.isNotificationsLoading = false)))
      .subscribe( notifications => {
        this.notificationsList = notifications;
      });
  }

  subscribeNotifications(): void {
    from(this.signalRService.registerHub(environment.signalrUrl, 'notificationHub'))
      .pipe(
        tap((hub) => {
          this.hubConnection = hub;
        })
      )
      .subscribe(() => {
        this.hubConnection.on(
          'onNewNotification',
          (notification: Notification) => {
            this.receivedNotify.next(notification);
          }
        );
        console.log(this.loggedInUser.email);
        this.hubConnection.invoke('onConect', this.loggedInUser.email);
      });
    this.receivedNotify$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (newNotification) => {
        this.notificationsList.push(newNotification);
        console.log('received a messsage ', newNotification);
      },
      (err) => {
        console.log(err.message);
      }
    );
  }
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  logOut(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/']));
  }

  onNotificationDelete(id: string): void {
    this.notificationsList = this.notificationsList.filter(n => n.id !== id );
    this.notificationService.DeleteNotification(id);
  }
}
