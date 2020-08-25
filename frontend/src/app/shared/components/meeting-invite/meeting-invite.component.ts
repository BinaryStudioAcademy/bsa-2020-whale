import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpService } from 'app/core/services';
import { environment } from '@env';
import { ToastrService } from 'ngx-toastr';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { MeetingInviteModalData } from '@shared/models/email/meeting-invite-modal-data';
import { MeetingInvite } from '@shared/models/email/meeting-invite';
import { Contact, User } from '@shared/models';

@Component({
  selector: 'app-meeting-invite',
  templateUrl: './meeting-invite.component.html',
  styleUrls: ['./meeting-invite.component.sass'],
})
export class MeetingInviteComponent
  extends SimpleModalComponent<MeetingInviteModalData, void>
  implements OnInit {
  public emails: string[] = [];
  public contacts: Contact[];
  public cachedContacts: Contact[];

  public form: FormGroup;
  public formSearch: FormGroup;

  public isLoading = false;

  meetingId: string;
  senderId: string;
  inviteLink: string;

  constructor(private httpService: HttpService, private toastr: ToastrService) {
    super();
    this.form = new FormGroup({
      email: new FormControl(''),
    });

    this.formSearch = new FormGroup({
      contactSearch: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getContacts();
  }

  public addEmailTag(): void {
    if (
      this.form.controls.email.value &&
      !this.emails.find((email) => email == this.form.controls.email.value)
    ) {
      this.emails.push(this.form.controls.email.value);
    }
    this.form.controls.email.setValue('');
  }

  public removeTag(email: string): void {
    this.emails.splice(
      this.emails.findIndex((e) => e == email),
      1
    );
  }

  public sendInvites() {
    this.isLoading = true;
    const inviteData: MeetingInvite = {
      meetingLink: this.inviteLink,
      meetingId: this.meetingId,
      senderId: this.senderId,
      receiverEmails: this.emails,
    };

    this.httpService
      .postRequest<MeetingInvite, null>(
        environment.apiUrl + '/api/email',
        inviteData
      )
      .subscribe(
        () => {
          this.toastr.success('Invites have been sent.', 'Success');
          this.toastr.info(
            'Only members of Whale will receive invites',
            'Info'
          );
          setTimeout(() => this.close(), 1000);
        },
        (error) => {
          this.toastr.error(error.Message);
          console.error(error);
          this.isLoading = false;
        }
      );
  }

  public getContacts() {
    this.httpService
      .getRequest<Contact[]>(environment.apiUrl + '/api/Contacts/accepted')
      .subscribe(
        (response) => {
          console.log(response);
          this.contacts = response;
          this.cachedContacts = response;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  public filterContacts(value: string) {
    this.cachedContacts = this.contacts.filter((contact) => {
      return `${contact.secondMember.firstName} ${contact.secondMember.secondName}`.includes(
        value
      );
    });
  }

  public onContactClicked(contact: Contact) {
    const index = this.emails.findIndex(
      (email) => email == contact.secondMember.email
    );
    if (index == -1) {
      this.emails.push(contact.secondMember.email);
    } else {
      this.emails.splice(index, 1);
    }
  }

  public getEmailOrName(email: string) {
    const contact = this.contacts.find((c) => c.secondMember.email == email);
    if (contact) {
      return this.getName(contact.secondMember);
    } else {
      return email;
    }
  }

  public getName(user: User) {
    return user.secondName
      ? `${user.firstName} ${user.secondName}`
      : user.firstName;
  }
}
