import { Component, OnInit } from '@angular/core';
import { Group, User } from '@shared/models';
import { SimpleModalComponent, SimpleModalService } from 'ngx-simple-modal';
import { Subject } from 'rxjs';
import {
  HttpService,
  WhaleSignalService,
  GroupService,
  BlobService,
} from 'app/core/services';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-group-info-modal',
  templateUrl: './edit-group-info-modal.component.html',
  styleUrls: ['./edit-group-info-modal.component.sass'],
})
export class EditGroupInfoModalComponent
  extends SimpleModalComponent<Group, Group>
  implements Group, OnInit {
  id: string;
  label: string;
  description: string;
  pinnedMessageId?: string;
  photoUrl?: string;
  creatorEmail?: string;
  private unsubscribe$ = new Subject<void>();
  public isImageCropped = false;
  public isFileUploaded = false;
  imageChangedEvent: any = '';
  croppedImage: string;
  groupMembers: User[];
  public fileToUpload: File;
  constructor(
    private whaleSignalrService: WhaleSignalService,
    private httpService: HttpService,
    private groupService: GroupService,
    private toastr: ToastrService,
    private authService: AuthService,
    private blobService: BlobService,
    private simpleModalService: SimpleModalService
  ) {
    super();
  }

  ngOnInit(): void {
    this.groupService
      .getAllGroupUsers(this.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (users) => {
          this.groupMembers = users;
        },
        (err) => {
          console.log(err.message);
          this.toastr.error(err.Message);
        }
      );
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

  public uploadPhoto(): void {
    const blob = this.dataURLtoBlob(this.croppedImage);
    this.blobService.postBlobUploadImage(blob).subscribe((resp) => {
      this.photoUrl = resp;
      console.log(`image: ${resp}`);
    });

    this.isImageCropped = false;
    this.croppedImage = '';
    this.imageChangedEvent = '';
  }

  public submit(): void {
    if (this.isFileUploaded) {
      const blob = this.dataURLtoBlob(this.croppedImage);
      this.blobService.postBlobUploadImage(blob).subscribe((photo) => {
        this.photoUrl = photo;
        this.groupService
          .updateGroup({
            id: this.id,
            label: this.label,
            description: this.description,
            pinnedMessageId: this.pinnedMessageId,
            photoUrl: this.photoUrl,
            creatorEmail: this.creatorEmail,
          })
          .subscribe(
            (resp) => {
              this.result = resp.body;
              this.close();
            },
            (error) => this.toastr.error(error.Message)
          );
      });
    } else {
      this.groupService
        .updateGroup({
          id: this.id,
          label: this.label,
          description: this.description,
          pinnedMessageId: this.pinnedMessageId,
          photoUrl: this.photoUrl,
          creatorEmail: this.creatorEmail,
        })
        .subscribe(
          (resp) => {
            this.result = resp.body;
            this.close();
          },
          (error) => this.toastr.error(error.Message)
        );
    }
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

  changeGroupAdmin(userEmail: string): void {
    this.creatorEmail = userEmail;
    console.log(this.creatorEmail);
  }
}
