import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {
  WhaleSignalService,
  WhaleSignalMethods,
  UpstateService,
  GroupService, MeetingSettingsService,
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
  implements Group, OnInit, OnDestroy {
  id: string;
  label: string;
  description: string;
  pinnedMessageId?: string;
  photoUrl?: string;

  isAnyoneThere: boolean;
  isAllRejected: boolean;
  link: MeetingLink;
  callCreator: User;
  membersAmount: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private whaleSignalrService: WhaleSignalService,
    private router: Router,
    private upstateService: UpstateService,
    private groupService: GroupService,
    private meetingSettingsService: MeetingSettingsService
  ) {
    super();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.isAnyoneThere = true;
    this.isAllRejected = false;
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
            isAudioAllowed: true,
            isVideoAllowed: true,
            isScheduled: false,
            isRecurrent: false,
            creatorEmail: this.callCreator.email,
            isWhiteboard: this.meetingSettingsService.getSettings().isWhiteboard,
            isPoll: this.meetingSettingsService.getSettings().isPoll,
          } as MeetingCreate,
        } as GroupCallStart);
      });
    this.groupService.getAllGroupUsers(this.id).subscribe((t) => {
      this.membersAmount = t.length;
    });

    this.whaleSignalrService.startCallCaller$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((link) => {
        this.link = link;
      });

    this.whaleSignalrService.declineGroupCall$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((t) => {
        if (t.userId === this.callCreator.id) {
          this.close();
        } else if (this.membersAmount === 2) {
          this.isAllRejected = true;
          setTimeout(() => {
            this.decline();
          }, 5000);
        } else {
          this.membersAmount -= 1;
        }
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
      callCreator: this.callCreator,
      meetingId: this?.link?.id,
    } as GroupCallDecline);
    this.close();
  }
  public isImageHere(): boolean {
    return (
      this.photoUrl !== null &&
      this.photoUrl !== undefined &&
      this.photoUrl !== ''
    );
  }
}
