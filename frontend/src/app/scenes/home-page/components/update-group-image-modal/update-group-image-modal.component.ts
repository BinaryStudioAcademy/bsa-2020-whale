import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { GroupService, BlobService } from 'app/core/services';
import { ToastrService } from 'ngx-toastr';
import { Group } from '@shared/models';

export interface UpdateGroupImageModal {
  group: Group;
}

@Component({
  selector: 'app-update-group-image-modal',
  templateUrl: './update-group-image-modal.component.html',
  styleUrls: ['./update-group-image-modal.component.sass'],
})
export class UpdateGroupImageModalComponent
  extends SimpleModalComponent<UpdateGroupImageModal, null>
  implements UpdateGroupImageModal {
  public isImageCropped = false;
  public isFileUploaded = false;
  imageChangedEvent: any = '';
  croppedImage: string;
  public fileToUpload: File;
  public group: Group;

  constructor(
    private groupService: GroupService,
    private toastr: ToastrService,
    private blobService: BlobService
  ) {
    super();
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
    this.isImageCropped = true;
  }

  public uploadFile(event): void {
    this.imageChangedEvent = event;

    const isImageCorrect = this.blobService.canUploadImage(event);

    if (isImageCorrect) {
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
    const blob = this.dataURLtoBlob(this.croppedImage);
    this.blobService.postBlobUploadImage(blob).subscribe((resp) => {
      this.group.photoUrl = resp;
      this.groupService.updateGroup(this.group).subscribe(
        () => {
          this.toastr.success('Group image successfuly changed');
        },
        (error) => this.toastr.error(error.Message)
      );
    });
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
