import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { BlobService } from '../../../../core/services/blob.service';
import { User } from '@shared/models/user';
import { HttpService } from '../../../../core/services/http.service';
import { AuthService } from '../../../../core/auth/auth.service';
import Avatar from 'avatar-initials';
import { LinkTypeEnum } from '@shared/Enums/LinkTypeEnum';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { UpstateService } from '../../../../core/services/upstate.service';

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

  @ViewChild('avatar')
  public avatar: ElementRef;

  @ViewChild('header')
  private header: PageHeaderComponent;

  public isShowCamera = false;
  public isImageCropped = false;
  public editName = false;
  updatedUser: User;

  public editTelephone = false;
  editTelephon: string;

  isShowUploadFile: boolean;
  loggedInUser: User;
  updatedUserDB: User;
  public routePrefix = '/api/user';

  imageChangedEvent: any = '';
  userPhotoFromCamera: any = '';
  croppedImage: any = '';
  fileToUpload: File;
  avatarURL = '';

  ngOnInit(): void {
    this.GetAvatar();
  }

  public constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private blobService: BlobService,
    private httpService: HttpService,
    private authService: AuthService,
    private upstateService: UpstateService
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
        this.loggedInUser.avatarUrl = this.avatarURL;
        const name = this.avatarURL.split('/').pop();
        this.updatedUserDB = Object.assign({}, this.loggedInUser);
        this.updatedUserDB.avatarUrl = name;
        this.updatedUserDB.linkType = LinkTypeEnum.Internal;
        this.httpService
          .putFullRequest<User, string>(
            `${this.routePrefix}`,
            this.updatedUserDB
          )
          .subscribe((response) => {
            console.log(`image: ${response.body}`);

            this.closeModal();
          });
      }
    });

    this.isImageCropped = false;
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
    this.upstateService.getLoggedInUser().subscribe(
      (userFromDB: User) => {
        this.loggedInUser = userFromDB;
        if (userFromDB.linkType === LinkTypeEnum.Internal) {
          this.updatedUser = {
            ...this.loggedInUser,
            avatarUrl: userFromDB.avatarUrl.split('/').pop(),
          };
          return;
        }
        this.updatedUser = this.loggedInUser;
      },
      (error) => this.toastr.error(error.Message)
    );
  }

  public removeAvatar(): void {
    const avatar = new Avatar(this.avatar, {
      useGravatar: false,
      initials: `${this.loggedInUser.firstName[0]}`,
      initial_fg: '#ffffff',
      initial_bg: '#00325c',
      initial_font_family: "'Lato', 'Lato-Regular', 'Helvetica Neue'",
    });

    this.loggedInUser.avatarUrl = avatar.element.src;
    this.loggedInUser.linkType = LinkTypeEnum.External;
    this.httpService
      .putFullRequest<User, string>(`${this.routePrefix}`, this.loggedInUser)
      .subscribe((response) => {
        console.log(`image: ${response.body}`);
        this.header.getUser();
      });
  }

  openModal(): void {
    this.modal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    this.closeCamera();
    this.GetAvatar();
    this.header.getUser();
    this.modal.nativeElement.style.display = 'none';
  }

  saveEditedUsername(): void {
    this.editName = !this.editName;
    this.httpService
      .putRequest<User, User>(`${this.routePrefix}`, this.updatedUser)
      .subscribe(
        (updUser: User) => {
          this.GetAvatar();
          this.header.getUser();
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
