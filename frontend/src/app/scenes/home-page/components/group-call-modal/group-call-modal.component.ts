import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import {
  WhaleSignalService,
  WhaleSignalMethods,
  UpstateService,
} from 'app/core/services';
import { Group } from '@shared/models/group/group';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';
import {
  MeetingLink,
  MeetingCreate,
  GroupCallStart,
  GroupCallDecline,
  User,
} from '@shared/models';
import { SimpleModalComponent } from 'ngx-simple-modal';

@Component({
  selector: 'app-group-call-modal',
  templateUrl: './group-call-modal.component.html',
  styleUrls: ['./group-call-modal.component.sass'],
})
export class GroupCallModalComponent extends SimpleModalComponent<Group, null>
  implements Group, OnInit {
  id: string;
  label: string;
  description: string;
  pinnedMessageId?: string;

  isAnyoneThere: Boolean;
  link: MeetingLink;
  callCreator: User;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private whaleSignalrService: WhaleSignalService,
    private router: Router,
    private upstateService: UpstateService
  ) {
    super();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.isAnyoneThere = true;
    this.upstateService
      .getLoggedInUser()
      .pipe(tap())
      .subscribe((userFromDB: User) => {
        this.callCreator = userFromDB;
        this.whaleSignalrService.invoke(WhaleSignalMethods.OnStartGroupCall, {
          groupId: this?.id,
          meeting: {
            settings: '',
            startTime: new Date(),
            anonymousCount: 0,
            isScheduled: false,
            isRecurrent: false,
            creatorEmail: this.callCreator.email,
          } as MeetingCreate,
        } as GroupCallStart);
      });
    this.whaleSignalrService.startCallCaller$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((link) => {
        this.link = link;
      });

    this.whaleSignalrService.declineGroupCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.close();
      });

    this.whaleSignalrService.takeGroupCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigate([
          '/meeting-page',
          `?id=${this.link.id}&pwd=${this.link.password}`,
        ]);
        this.close();
      });
    setTimeout(() => {
      this.isAnyoneThere = false;
      setTimeout(() => {
        this.decline();
      }, 5000);
    }, 100000);
  }

  decline(): void {
    this.whaleSignalrService.invoke(WhaleSignalMethods.OnDeclineGroupCall, {
      userId: this.callCreator.id,
      groupId: this.id,
      email: this.callCreator.email,
      meetingId: this?.link?.id,
    } as GroupCallDecline);
    this.close();
  }
}
