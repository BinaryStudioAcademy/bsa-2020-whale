import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Notification } from 'app/shared/models/notification/notification';
import { User } from '@shared/models/user';
import { tap, takeUntil } from 'rxjs/operators';
import { UpstateService } from '../../../core/services/upstate.service';
import { NotificationService } from 'app/core/services/notification.service';
import { Subject } from 'rxjs';
import { WhaleSignalService, WhaleSignalMethods } from 'app/core/services';
import { GroupMembersVisibilityService } from 'app/core/services/group-members-visibility.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.sass'],
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Output() openChatClicked = new EventEmitter<string>();
  @Output() openGroupChatClicked = new EventEmitter<string>();

  public isUserLoadig = true;
  private unsubscribe$ = new Subject<void>();

  settingsMenuVisible = false;
  isNotificationsVisible = false;
  loggedInUser: User;

  public notificationsList: Notification[];

  constructor(
    private router: Router,
    public auth: AuthService,
    private upstateService: UpstateService,
    private notificationService: NotificationService,
    private whaleSignalrService: WhaleSignalService,
    private groupMembersVisibility: GroupMembersVisibilityService,
  ) {}

  public showNotificationsMenu(): void {
    if (this.notificationsList.length) {
      if (this.settingsMenuVisible) {
        this.settingsMenuVisible = false;
      }

      window.onclick = null;
      this.isNotificationsVisible = !this.isNotificationsVisible;
      this.groupMembersVisibility.isMembersVisible = false;

      if (this.isNotificationsVisible) {
        window.onclick = () => {
          this.isNotificationsVisible = false;
        };
      }
    }
  }

  public showSettingsMenu(): void {
    if (this.isNotificationsVisible) {
      this.isNotificationsVisible = false;
    }

    window.onclick = null;
    this.settingsMenuVisible = !this.settingsMenuVisible;
    this.groupMembersVisibility.isMembersVisible = false;

    if (this.settingsMenuVisible) {
      window.onclick = () => {
        this.settingsMenuVisible = false;
      };
    }
  }

  ngOnInit(): void {
    this.getUser();
    this.getNotifications();
    this.subscribeNotifications();
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
      });
  }
  getNotifications(): void {
    this.notificationService.GetNotifications().subscribe((notifications) => {
      this.notificationsList = notifications;
    });
  }

  subscribeNotifications(): void {
    this.whaleSignalrService.receiveNotify$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((newNotification) => {
        this.notificationsList.push(newNotification);
      });

    this.whaleSignalrService.updateNotify$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((updateNotification) => {
        const index = this.notificationsList.findIndex(
          (n) => n.id === updateNotification.id
        );
        if (index >= 0) {
          this.notificationsList[index] = updateNotification;
        }
      });

    this.whaleSignalrService.removeNotify$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((notificationId) => {
        this.notificationsList = this.notificationsList.filter(
          (n) => n.id !== notificationId
        );
        if (!this.notificationsList.length) {
          this.isNotificationsVisible = false;
        }
      });
  }

  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }

  logOut(): void {
    this.whaleSignalrService
      .invoke(WhaleSignalMethods.OnUserDisconnect, this.loggedInUser.email)
      .subscribe(() =>
        this.auth.logout().subscribe(() => this.router.navigate(['landing']))
      );
  }

  onNotificationDelete(id: string): void {
    this.notificationsList = this.notificationsList.filter((n) => n.id !== id);
    this.notificationService.DeleteNotification(id);
    if (!this.notificationsList.length) {
      this.isNotificationsVisible = false;
    }
  }

  onOpenChat(contactId: string): void {
    this.openChatClicked.emit(contactId);
  }

  onOpenGroupChat(groupId: string): void {
    this.openGroupChatClicked.emit(groupId);
  }
}
