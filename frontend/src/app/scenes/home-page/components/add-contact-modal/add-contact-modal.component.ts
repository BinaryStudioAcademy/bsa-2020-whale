import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from 'app/shared/models/contact/contact';
import { ContactService } from 'app/core/services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-add-contact-modal',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.sass'],
})
export class AddContactModalComponent extends SimpleModalComponent<
  null,
  Contact
> {
  public contacterEmail: string;
  public ownerEmail: string;
  constructor(
    private contactService: ContactService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    super();
    this.ownerEmail = authService.currentUser.email;
  }

  public submit(): void {
    this.contactService
      .createContactByEmail(this.contacterEmail.toLowerCase())
      .subscribe(
        (resp) => {
          if (resp.body.isAccepted) {
            this.toastr.success('Request has been sent');
          }
          else {
            this.toastr.success('Contact has been added');
          }
          this.result = resp.body;
          this.close();
        },
        (error) => this.toastr.error(error.Message)
      );
  }

  public cancel(dirty: boolean): void {
    if (dirty) {
      if (confirm('Are you sure want to leave?')) {
        this.close();
      }
    } else {
      this.close();
    }
  }
}
