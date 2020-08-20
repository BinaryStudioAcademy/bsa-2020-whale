import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Notification } from 'app/shared/models/notification/notification';
import { User } from '@shared/models/user';
import { HttpService } from '../../../core/services/http.service';
import { tap, filter } from 'rxjs/operators';
import { BlobService } from '../../../core/services/blob.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { UpstateService } from '../../../core/services/upstate.service';
import { NotificationService } from 'app/core/services/notification.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit {
  public isUserLoadig = true;
  public isNotificationsLoading = true;

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
    private notificationService: NotificationService
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

  getUser(): void {
    this.upstateService
      .getLoggedInUser()
      .pipe(tap(() => (this.isUserLoadig = false)))
      .subscribe((userFromDB: User) => {
        this.loggedInUser = userFromDB;
      });
  }
  getNotifications(): void {
    this.notificationService
      .GetNotifications()
      .pipe(tap(() => (this.isNotificationsLoading = false)))
      .subscribe((notifications) => {
        this.notificationsList = notifications;
      });
  }
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  logOut(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/']));
  }

  onNotificationDelete(id: string): void {
    this.notificationsList = this.notificationsList.filter((n) => n.id !== id);
    this.notificationService.DeleteNotification(id);
  }
}
