import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from 'app/shared/models/contact/contact';
import { GroupService } from 'app/core/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { GroupUser } from '@shared/models/group/groupuser';
import { Group } from '@shared/models/group/group';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpService } from 'app/core/services';
import { environment } from '@env';
import { User } from '@shared/models/user/user';

export interface AddUserToGroupModal extends Group {
  participantsEmails: string[];
}

@Component({
  selector: 'app-add-user-to-group-modal',
  templateUrl: './add-user-to-group-modal.component.html',
  styleUrls: ['./add-user-to-group-modal.component.sass'],
})
export class AddUserToGroupModalComponent
  extends SimpleModalComponent<AddUserToGroupModal, GroupUser>
  implements AddUserToGroupModal, OnInit {
  id: string;
  label: string;
  description: string;
  pinnedMessageId?: string;
  public emails: string[] = [];
  public contacts: Contact[];
  public cachedContacts: Contact[];
  participantsEmails: string[];

  public form: FormGroup;
  public formSearch: FormGroup;

  public isLoading = false;
  public isContactsLoading = false;

  selectedContacts = new Array<Contact>();
  public groupsUser = new Array<GroupUser>();
  constructor(
    private groupService: GroupService,
    private toastr: ToastrService,
    private authService: AuthService,
    private httpService: HttpService
  ) {
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

  public getContacts(): void {
    this.isContactsLoading = true;
    this.httpService
      .getRequest<Contact[]>(environment.apiUrl + '/api/Contacts/accepted')
      .subscribe(
        (response) => {
          const filteredGroups = response.filter(
            (c) =>
              !this.participantsEmails.find((e) => e === c.secondMember.email)
          );
          this.contacts = Array.from(filteredGroups);
          this.cachedContacts = Array.from(filteredGroups);
          this.isContactsLoading = false;
        },
        (error) => {
          this.isContactsLoading = false;
        }
      );
  }

  public addMemberToList(contact: Contact): void {
    this.selectedContacts.push(contact);
    this.emails.push(contact.secondMember.email);
    this.groupsUser.push({
      groupId: this.id,
      userEmail: contact.secondMember.email,
    });
    this.cachedContacts.splice(this.cachedContacts.indexOf(contact), 1);
    this.contacts.splice(this.contacts.indexOf(contact), 1);
  }

  public addEmailTag(valid: boolean): void {
    if (valid) {
      const emailValue = this.form.controls.email.value.toLowerCase();
      const isParticipant =
        this.participantsEmails.find((e) => e === emailValue) !== undefined;
      if (isParticipant) {
        this.toastr.show(`${emailValue} is already participant of group.`);
      }
      if (this.emails.find((email) => email === emailValue)) {
        this.toastr.show(`${emailValue} is already added.`);
      }
      if (
        emailValue &&
        !this.emails.find((email) => email === emailValue) &&
        !isParticipant
      ) {
        this.emails.push(emailValue);
      }
      this.form.controls.email.setValue('');
    }
  }

  public removeTag(email: string): void {
    this.emails.splice(this.emails.indexOf(email), 1);
    const contact = this.selectedContacts.find(
      (c) => c.secondMember.email === email
    );
    if (contact) {
      this.cachedContacts.push(contact);
      this.contacts.push(contact);
      this.selectedContacts.splice(this.selectedContacts.indexOf(contact), 1);
    }
  }

  public addMembers(): void {
    this.isLoading = true;
    this.groupsUser.forEach((u) => {
      u.groupId = this.id;
      this.groupService.addUserToGroup(u).subscribe(
        (resp) => {
          this.result = resp.body;
          setTimeout(() => this.close(), 1000);
        },
        (error) => this.toastr.error(error.Message)
      );
    });
  }

  public filterContacts(value: string): void {
    this.cachedContacts = this.contacts.filter((contact) => {
      return `${contact.secondMember.firstName} ${contact.secondMember.secondName}`.includes(
        value
      );
    });
  }

  public getEmailOrName(email: string): string {
    const contact = this.selectedContacts.find(
      (c) => c.secondMember.email === email
    );
    if (contact) {
      return this.getName(contact.secondMember);
    } else {
      return email;
    }
  }

  public getName(user: User): string {
    return user.secondName
      ? `${user.firstName} ${user.secondName}`
      : user.firstName;
  }
}
