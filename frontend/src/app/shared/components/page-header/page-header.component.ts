import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Notification } from 'app/shared/models/notification/notification';
import { User } from '@shared/models/user';
import { HttpService } from '../../../core/services/http.service';
import { tap, filter } from 'rxjs/operators';
import { BlobService } from '../../../core/services/blob.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit {
  public isUserLoadig = true;

  settingsMenuVisible = false;
  isNotificationsVisible = false;
  loggedInUser: User;
  public routePrefix = '/api/user';

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

  constructor(
    private router: Router,
    public auth: AuthService,
    private httpService: HttpService,
    private blobService: BlobService
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
  }

  getUser(): void {
    this.auth.user$.pipe(filter((user) => Boolean(user))).subscribe((user) => {
      this.httpService
        .getRequest<User>(`${this.routePrefix}/email/${user.email}`)
        .pipe(tap(() => (this.isUserLoadig = false)))
        .subscribe((userFromDB: User) => {
          this.loggedInUser = userFromDB;
          if (userFromDB.linkType === LinkTypeEnum.Internal) {
            this.blobService
              .GetImageByName(userFromDB.avatarUrl)
              .subscribe((fullLink: string) => {
                userFromDB.avatarUrl = fullLink;
                this.loggedInUser = userFromDB;
              });
          } else {
            this.loggedInUser = userFromDB;
          }
        });
    });
  }
  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
  logOut(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/']));
  }
}
