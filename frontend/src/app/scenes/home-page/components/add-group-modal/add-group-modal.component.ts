import { Component } from '@angular/core';
import { SimpleModalComponent, SimpleModalService } from 'ngx-simple-modal';
import { Group } from 'app/shared/models/group/group';
import { GroupService } from 'app/core/services/group.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { BlobService } from 'app/core/services/blob.service';
import { AddUserToGroupModalComponent } from '../add-user-to-group-modal/add-user-to-group-modal.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';

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
  public isImageCropped = false;
  public isFileUploaded = false;
  imageChangedEvent: any = '';
  croppedImage: string;
  public fileToUpload: File;

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

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
    this.isImageCropped = true;
  }

  public uploadFile(event): void {
    this.isFileUploaded = false;
    this.imageChangedEvent = event;

    const image = event.target.files[0];
    if (!image) {
      event.target.value = '';
      return;
    }

    if (image.size / 1024 / 1024 < 5) {
      this.fileToUpload = event.target.files[0];
      this.isFileUploaded = true;
    } else {
      this.toastr.error(`File can't be heavier than ~5MB`);
    }
  }

  public imageCroppedUpload(event: ImageCroppedEvent): void {
    // Preview
    this.croppedImage = event.base64;
  }

  public submit(): void {
    this.newGroup.creatorEmail = this.authService.currentUser.email;
    if (this.isFileUploaded) {
      const blob = this.dataURLtoBlob(this.croppedImage);
      this.blobService.postBlobUploadImage(blob).subscribe((photo) => {
        this.newGroup.photoUrl = photo;
        this.createGroup(this.newGroup);
      });
    } else {
      this.createGroup(this.newGroup);
    }
  }

  public createGroup(group: Group): void {
    this.groupService.createGroup(this.newGroup).subscribe(
      (resp) => {
        this.result = resp.body;
        this.close();
        this.simpleModalService
          .addModal(AddUserToGroupModalComponent, {
            id: this.result.id,
            label: this.result.label,
            description: this.result.description,
            participantsEmails: [this.ownerEmail],
          })
          .subscribe((user) => {
            if (user !== undefined) {
              this.toastr.success(`Users added successfully`);
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
      this.closeModal();
    }
  }

  public closeModal(): void {
    this.isImageCropped = false;
    this.croppedImage = '';
    this.imageChangedEvent = '';
    this.close();
  }

  private dataURLtoBlob(dataURL: any): Blob {
    let byteString: string;
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = unescape(dataURL.split(',')[1]);
    }

    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }
}
