import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Notification } from 'app/shared/models/notification/notification';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit {
  settingsMenuVisible = false;
  isNotificationsVisible = false;

  notification1: Notification = {
    text: 'Missed call from USER',
    time: new Date(2020, 5, 11, 8, 25, 42),
  };
  notification2: Notification = {
    text: 'USER want to add you to contacts',
    time: new Date(2020, 7, 13, 17, 25, 12),
  };
  notification3: Notification = {
    text: 'Missed call from USER',
    time: new Date(2020, 9, 2, 21, 20, 2),
  };

  public notificationsList: Notification[] = [
    this.notification1,
    this.notification2,
    this.notification3,
  ];

  constructor(private router: Router, public auth: AuthService) {}

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

  ngOnInit(): void {}
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  logOut(): void {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
