import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { HttpService } from 'app/core/services/http.service';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { AddGroupModalComponent } from '../add-group-modal/add-group-modal.component';
import { ContactsChatComponent } from '../contacts-chat/contacts-chat.component';
import { ToastrService } from 'ngx-toastr';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { BlobService } from '../../../../core/services/blob.service';
import { Group } from '@shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { UpstateService } from '../../../../core/services/upstate.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  contacts: Contact[];
  groups: Group[];
  loggedInUser: User;
  contactsVisibility = false;
  groupsVisibility = false;
  chatVisibility = true;
  ownerEmail: string;
  contactSelected: Contact;

  public isContactsLoading = true;
  public isUserLoadig = true;
  public isMeetingLoading = false;
  public isGroupsLoading = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private toastr: ToastrService,
    private httpService: HttpService,
    private simpleModalService: SimpleModalService,
    private meetingService: MeetingService,
    private router: Router,
    private authService: AuthService,
    private groupService: GroupService,
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
          this.loggedInUser = userFromDB;
          this.ownerEmail = this.loggedInUser?.email;

          this.httpService
            .getRequest<Contact[]>('/api/contacts')
            .pipe(tap(() => (this.isContactsLoading = false)))
            .subscribe(
              (data: Contact[]) => {
                this.contacts = data;
              },
              (error) => this.toastr.error(error.Message)
            );
        },
        (error) => this.toastr.error(error.Message)
      );
    this.groupService
      .getAllGroups()
      .pipe(tap(() => (this.isGroupsLoading = false)))
      .subscribe(
        (data: Group[]) => {
          this.groups = data;
        },
        (error) => this.toastr.error(error.Message)
      );
  }

  addNewGroup(): void {
    this.simpleModalService
      .addModal(AddGroupModalComponent)
      .subscribe((group) => {
        if (group !== undefined) {
          this.groups.push(group);
        }
      });
  }

  deleteGroup(group: Group): void {
    if (
      confirm('Are you sure want to delete the group ' + group.label + ' ?')
    ) {
      this.groupService.deleteGroup(group).subscribe(
        (response) => {
          if (response.status === 204) {
            this.toastr.success('Deleted successfuly');
            this.groups.splice(this.groups.indexOf(group), 1);
          }
        },
        (error) => this.toastr.error(error.Message)
      );
    }
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

  visibilityChange(event): void {
    this.chatVisibility = event;
    this.contactSelected = undefined;
  }
  onContactClick(contact: Contact): void {
    this.chatVisibility = false;
    this.contactSelected = contact;
  }

  onGroupClick(group: Group): void {}

  isContactActive(contact): boolean {
    return this.contactSelected === contact;
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
