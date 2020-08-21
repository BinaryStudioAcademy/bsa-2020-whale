import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Contact } from 'app/shared/models/contact/contact';
import { GroupService } from 'app/core/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { GroupUser } from '@shared/models/group/groupuser';
import { Group } from '@shared/models/group/group';

@Component({
  selector: 'app-add-user-to-group-modal',
  templateUrl: './add-user-to-group-modal.component.html',
  styleUrls: ['./add-user-to-group-modal.component.sass'],
})
export class AddUserToGroupModalComponent
  extends SimpleModalComponent<Group, GroupUser>
  implements Group {
  public groupUser: GroupUser = {
    userEmail: '',
    groupId: '',
  };
  id: string;
  label: string;
  description: string;
  pinnedMessageId?: string;
  constructor(
    private groupService: GroupService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {}
  public submit(): void {
    this.groupUser.groupId = this.id;
    console.log(this.groupUser);
    this.groupService.addUserToGroup(this.groupUser).subscribe(
      (resp) => {
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
