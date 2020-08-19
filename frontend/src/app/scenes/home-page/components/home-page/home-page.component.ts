import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { HttpService } from 'app/core/services/http.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { BlobService } from '../../../../core/services/blob.service';
import { UpstateService } from '../../../../core/services/upstate.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  contacts: Contact[];
  loggedInUser: User;
  actionsVisibility = true;
  contactsVisibility = false;
  groupsVisibility = false;
  chatVisibility = false;
  historyVisibility = false;

  ownerEmail: string;
  contactSelected: Contact;

  public isContactsLoading = true;
  public isUserLoadig = true;
  public isMeetingLoading = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private toastr: ToastrService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private meetingService: MeetingService,
    private router: Router,
    private authService: AuthService,
    private blobService: BlobService,
    private upstateService: UpstateService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.upstateService
      .getLoggedInUser()
      .pipe(tap(() => (this.isUserLoadig = false)))
      .subscribe(
        (userFromDB: User) => {
          this.loggedInUser = { ...userFromDB, avatarUrl: null };
          if (userFromDB.linkType === LinkTypeEnum.Internal) {
            this.blobService
              .GetImageByName(userFromDB.avatarUrl)
              .subscribe((fullLink: string) => {
                this.loggedInUser.avatarUrl = fullLink;
              });
          } else {
            this.loggedInUser.avatarUrl = userFromDB.avatarUrl;
          }
          this.ownerEmail = this.loggedInUser?.email;

          this.httpService
            .getRequest<Contact[]>('/api/contacts')
            .pipe(tap(() => (this.isContactsLoading = false)))
            .subscribe(
              (data: Contact[]) => {
                this.contacts = data;
                data.forEach((contact) => {
                  if (contact.secondMember.linkType === LinkTypeEnum.Internal) {
                    this.blobService
                      .GetImageByName(contact.secondMember.avatarUrl)
                      .subscribe((fullLink: string) => {
                        contact.secondMember.avatarUrl = fullLink;
                      });
                  }
                });
                this.onContactsClick();
              },
              (error) => this.toastr.error(error.Message)
            );
        },
        (error) => this.toastr.error(error.Message)
      );
  }

  addNewGroup(): void {
    console.log('group clicked!');
  }

  addNewContact(): void {
    this.simpleModalService
      .addModal(AddContactModalComponent)
      .subscribe((contact) => {
        if (contact !== undefined) {
          this.contacts.push(contact);
        }
      });
  }

  createMeeting(): void {
    this.isMeetingLoading = true;
    this.meetingService
      .createMeeting({
        settings: '',
        startTime: new Date(),
        anonymousCount: 0,
        isScheduled: false,
        isRecurrent: false,
        creatorEmail: this.ownerEmail,
      } as MeetingCreate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (resp) => {
          const meetingLink = resp.body;
          this.router.navigate([
            '/meeting-page',
            `?id=${meetingLink.id}&pwd=${meetingLink.password}`,
          ]);
        },
        (error) => console.log(error.message)
      );
  }

  goToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }

  public falseAllBooleans() {
    this.chatVisibility = false;
    this.groupsVisibility = false;
    this.contactsVisibility = false;
    this.actionsVisibility = false;
    this.historyVisibility = false;
  }

  visibilityChange(event): void {
    console.log(event);
    this.chatVisibility = event;
    this.contactSelected = undefined;
    this.actionsVisibility = true;
  }

  onContactClick(contact: Contact): void {
    this.falseAllBooleans();
    this.chatVisibility = true;
    this.contactSelected = contact;
  }

  onGroupClick(): void {
    this.falseAllBooleans();
    this.chatVisibility = true;
  }

  isContactActive(contact): boolean {
    return this.contactSelected === contact;
  }

  public onMeetingHistoryClick() {
    this.chatVisibility = false;
    this.groupsVisibility = false;
    this.contactsVisibility = false;
    this.actionsVisibility = false;

    this.historyVisibility = !this.historyVisibility;

    if (!this.historyVisibility) {
      this.actionsVisibility = true;
    }
  }

  returnCorrectLink(contact: Contact): string {
    return contact?.secondMember.avatarUrl.startsWith('http') ||
      contact?.secondMember.avatarUrl.startsWith('data')
      ? contact?.secondMember.avatarUrl
      : '';
  }

  public onContactsClick(): void {
    if (this.contacts.length) {
      this.contactsVisibility = !this.contactsVisibility;
    }
  }
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
