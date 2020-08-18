import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { Group } from 'app/shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-add-group-modal',
  templateUrl: './add-group-modal.component.html',
  styleUrls: ['./add-group-modal.component.sass'],
})
export class AddGroupModalComponent extends SimpleModalComponent<null, Group> {
  public ownerEmail: string;
  public newGroup: Group = {
    id: '',
    label: '',
    description: '',
  };
  constructor(
    private groupService: GroupService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    super();
    this.ownerEmail = authService.currentUser.email;
  }

  public submit(): void {
    this.groupService.createGroup(this.ownerEmail, this.newGroup).subscribe(
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
