import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { BlobService } from '../../../../core/services/blob.service';
import { User } from '@shared/models/user';
import { HttpService } from '../../../../core/services/http.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.sass'],
})
export class ProfilePageComponent implements OnInit {
  @ViewChild('video')
  public video: ElementRef;

  @ViewChild('canvas')
  public canvas: ElementRef;

  @ViewChild('cameraModal')
  public modal: ElementRef;

  public isShowCamera = false;
  public isImageCropped = false;
  public editName = false;
  updatedUser: User;

  public editTelephone = false;
  editTelephon: string;

  isShowUploadFile: boolean;
  loggedInUser: User;
  public routePrefix = '/api/user';

  imageChangedEvent: any = '';
  userPhotoFromCamera: any = '';
  croppedImage: any = '';
  fileToUpload: File;
  avatarURL = '';
  userMockup = {} as User;

  ngOnInit(): void {
    this.GetAvatar();
  }

  public constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private blobService: BlobService,
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  fileChangeEvent(event: any): void {}
  imageLoaded(): void {}
  cropperReady(): void {}
  loadImageFailed(): void {}

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
    this.isImageCropped = true;
  }

  public uploadFile(event): void {
    this.imageChangedEvent = event;
    this.fileToUpload = event.target.files[0];
    if (!this.fileToUpload) {
      event.target.value = '';
      return;
    }

    const size = this.fileToUpload.size / 1024 / 1024;

    if (size > 5) {
      this.toastr.error("File can't be heavier than ~5MB");
    }
    this.isShowUploadFile = true;
  }

  public imageCroppedUpload(event: ImageCroppedEvent): void {
    // Preview
    this.croppedImage = event.base64;
  }

  public SendImage(): void {
    const blob = this.dataURLtoBlob(this.croppedImage);
    this.blobService.postBlobUploadImage(blob).subscribe((resp) => {
      console.log(`image: ${resp}`);
      this.avatarURL = resp;
      if (this.avatarURL !== '') {
        this.userMockup.id = '216D29C0-C230-4DEB-B40D-EDF67D906D3A';
        this.userMockup.firstName = 'Alex';
        this.userMockup.secondName = 'Belokon';
        this.userMockup.email = 'alex.belokon.onyx@gmail.com';
        this.userMockup.avatarUrl = this.avatarURL;
        this.httpService
          .putFullRequest<User, string>(`${this.routePrefix}`, this.userMockup)
          .subscribe((response) => console.log(`image: ${response.body}`));
      }
    });

    this.croppedImage = '';
    this.userPhotoFromCamera = '';
    this.isShowUploadFile = false;
    this.imageChangedEvent = '';
  }

  public showCamera(): void {
    this.isShowCamera = !this.isShowCamera;
    this.isShowUploadFile = false;
    this.userPhotoFromCamera = '';
    this.imageChangedEvent = '';

    if (
      this.isShowCamera &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      });
    } else if (!this.isShowCamera) {
      this.video.nativeElement.srcObject.getTracks()[0].stop();
      this.video.nativeElement.pause();
    }
  }

  public closeCamera(): void {
    if (this.video != null) {
      this.video.nativeElement.srcObject.getTracks()[0].stop();
      this.video.nativeElement.pause();

      this.userPhotoFromCamera = '';

      this.isShowCamera = false;
    }
  }

  public capture(): void {
    this.canvas.nativeElement
      .getContext('2d')
      .drawImage(this.video.nativeElement, 0, 0, 640, 480);

    this.video.nativeElement.pause();
    this.video.nativeElement.style.display = 'none';

    const dataURL = this.canvas.nativeElement.toDataURL('image/png');

    this.userPhotoFromCamera = dataURL;
  }

  public saveAvatarFromCamera(): void {
    const blob = this.dataURLtoBlob(this.croppedImage);

    const size = blob.size / 1024 / 1024;

    if (size < 5) {
      this.blobService.postBlobUploadImage(blob).subscribe((resp) => {
        console.log(`image: ${resp}`);
      });
    } else {
      this.toastr.error('File size is too large');
    }
  }
  /*
  private postBlob(blob: Blob): void {
    const formData = new FormData();

    formData.append('user-image', blob, 'image');

    this.http
      .post('http://localhost:51569/api/storage/save', formData, {
        responseType: 'text',
      })
      .subscribe((resp) => console.log(`image: ${resp}`));
  }*/

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

  private GetAvatar(): void {
    this.authService.user$.subscribe((user) => {
      this.httpService
        .getRequest<User>(`${this.routePrefix}/email/${user.email}`)
        .subscribe(
          (userFromDB: User) => {
            this.loggedInUser = userFromDB;
            this.updatedUser = this.loggedInUser;
          },
          (error) => this.toastr.error(error.Message)
        );
    });
  }

  openModal(): void {
    this.modal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    this.closeCamera();
    this.GetAvatar();
    this.modal.nativeElement.style.display = 'none';
  }

  saveEditedUsername(): void {
    this.editName = !this.editName;
    this.httpService
      .putRequest<User, User>(`${this.routePrefix}`, this.updatedUser)
      .subscribe(
        (updUser: User) => {
          this.GetAvatar();
        },
        (error) => this.toastr.error(error.Message)
      );
  }
  saveEditedTelephone(): void {
    this.editTelephone = !this.editTelephone;
    this.httpService
      .putRequest<User, User>(`${this.routePrefix}`, this.updatedUser)
      .subscribe(
        (updUser: User) => {
          this.GetAvatar();
        },
        (error) => this.toastr.error(error.Message)
      );
  }
}
