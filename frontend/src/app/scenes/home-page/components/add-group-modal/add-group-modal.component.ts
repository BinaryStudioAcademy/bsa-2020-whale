import { Component } from '@angular/core';
import { SimpleModalComponent, SimpleModalService } from 'ngx-simple-modal';
import { Group } from 'app/shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { BlobService } from 'app/core/services/blob.service';
import { AddUserToGroupModalComponent } from '../add-user-to-group-modal/add-user-to-group-modal.component';

@Component({
  selector: 'app-add-group-modal',
  templateUrl: './add-group-modal.component.html',
  styleUrls: ['./add-group-modal.component.sass'],
})
export class AddGroupModalComponent extends SimpleModalComponent<null, Group> {
  public ownerEmail: string;
  public imageName: string;
  public newGroup: Group = {
    id: '',
    label: '',
    description: '',
    creatorEmail: '',
    photoUrl: '',
  };
  constructor(
    private groupService: GroupService,
    private toastr: ToastrService,
    private authService: AuthService,
    private blobService: BlobService,
    private simpleModalService: SimpleModalService
  ) {
    super();
    this.ownerEmail = authService.currentUser.email;
  }

  public uploadPhoto(event): void {
    const photo = event.target.files[0];

    this.blobService.postBlobUploadImage(photo).subscribe((resp) => {
      this.newGroup.photoUrl = resp;
      console.log(`image: ${resp}`);
    });
  }

  public submit(): void {
    this.newGroup.creatorEmail = this.authService.currentUser.email;
    this.groupService.createGroup(this.newGroup).subscribe(
      (resp) => {
        this.result = resp.body;
        this.close();
        this.simpleModalService
          .addModal(AddUserToGroupModalComponent, {
            id: this.result.id,
            label: this.result.label,
            description: this.result.description,
          })
          .subscribe((user) => {
            if (user !== undefined) {
              this.toastr.success(`Users added successfuly`);
            }
          });
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
