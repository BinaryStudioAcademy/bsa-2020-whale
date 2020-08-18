import {
  Component,
  OnInit,
  EventEmitter,
  ViewChild,
  Output,
  OnDestroy,
} from '@angular/core';
import { User } from '@shared/models/user/user';
import { Contact } from '@shared/models/contact/contact';
import { SignalRService } from 'app/core/services/signal-r.service';
import { HttpService } from 'app/core/services/http.service';
import { HubConnection } from '@aspnet/signalr';
import { SimpleModalService } from 'ngx-simple-modal';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { AddGroupModalComponent } from '../add-group-modal/add-group-modal.component';
import { ContactsChatComponent } from '../contacts-chat/contacts-chat.component';
import { ToastrService } from 'ngx-toastr';
import { UpstateService } from 'app/core/services/upstate.service';
import { MeetingService } from 'app/core/services/meeting.service';
import { Router } from '@angular/router';
import { MeetingCreate } from '@shared/models/meeting/meeting-create';
import { takeUntil, tap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { BlobService } from '../../../../core/services/blob.service';
import { Group } from '@shared/models/group/group';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  contacts: Contact[];
  groups: Group[];
  loggedInUser: User;
  contactsVisibility = true;
  groupsVisibility = false;
  chatVisibility = true;
  ownerEmail: string;
  public routePrefix = '/api/user/email';
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
    private blobService: BlobService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.authService.user$
      .pipe(filter((user) => Boolean(user)))
      .subscribe((user) => {
        this.httpService
          .getRequest<User>(`${this.routePrefix}/${user.email}`)
          .pipe(tap(() => (this.isUserLoadig = false)))
          .subscribe(
            (userFromDB: User) => {
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
              this.ownerEmail = this.loggedInUser?.email;
            },
            (error) => this.toastr.error(error.Message)
          );

        this.httpService
          .getRequest<Contact[]>('/api/contacts')
          .pipe(tap(() => (this.isContactsLoading = false)))
          .subscribe(
            (data: Contact[]) => {
              this.contacts = data;
            },
            (error) => this.toastr.error(error.Message)
          );
      });
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

  onGroupClick(): void {
    this.chatVisibility = !this.chatVisibility;
  }
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
}
export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}
