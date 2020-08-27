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
  public selectedContacts: Contact[] = [];

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

  public getContacts() {
    this.httpService
      .getRequest<Contact[]>(environment.apiUrl + '/api/Contacts/accepted')
      .subscribe(
        (response) => {
          console.log(response);
          this.contacts = response.filter((c) => true);
          this.cachedContacts = response.filter((c) => true);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  public onContactClicked(contact: Contact) {
    this.selectedContacts.push(contact);
    this.emails.push(contact.secondMember.email);
    this.cachedContacts.splice(this.cachedContacts.indexOf(contact), 1);
    this.contacts.splice(this.contacts.indexOf(contact), 1);
  }

  public addEmailTag(valid: boolean): void {
    if (valid) {
      if (
        this.form.controls.email.value &&
        !this.emails.find(
          (email) => email == this.form.controls.email.value.toLowerCase()
        )
      ) {
        this.emails.push(this.form.controls.email.value.toLowerCase());
      }
      this.form.controls.email.setValue('');
    }
  }

  public removeTag(email: string): void {
    this.emails.splice(this.emails.indexOf(email), 1);
    // console.log(this.emails.indexOf(email));
    const contact = this.selectedContacts.find(
      (c) => c.secondMember.email == email
    );
    // console.log(contact);
    // console.log(email);
    // console.log(this.selectedContacts.indexOf(contact));
    if (contact) {
      this.cachedContacts.push(contact);
      this.contacts.push(contact);
      this.selectedContacts.splice(this.selectedContacts.indexOf(contact), 1);
    }
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

  public filterContacts(value: string) {
    console.log(this.contacts);
    this.cachedContacts = this.contacts.filter((contact) => {
      return `${contact.secondMember.firstName} ${contact.secondMember.secondName}`.includes(
        value
      );
    });
  }

  public getEmailOrName(email: string) {
    const contact = this.selectedContacts.find(
      (c) => c.secondMember.email == email
    );
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
