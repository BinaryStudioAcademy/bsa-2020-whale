import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';

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

  imageChangedEvent: any = '';
  userPhotoFromCamera: any = '';
  croppedImage: any = '';

  ngOnInit(): void {}

  public constructor(private http: HttpClient, private toastr: ToastrService) {}

  fileChangeEvent(event: any): void {}
  imageLoaded(): void {}
  cropperReady(): void {}
  loadImageFailed(): void {}

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
    this.isImageCropped = true;
  }

  public showCamera(): void {
    this.isShowCamera = !this.isShowCamera;

    if (this.isShowCamera) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
        });
      }
    } else if (!this.isShowCamera) {
      this.video.nativeElement.srcObject.getTracks()[0].stop();
      this.video.nativeElement.pause();
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
      this.postBlob(blob);
    } else {
      this.toastr.error('File size is too large');
    }
  }

  private postBlob(blob: Blob): void {
    const formData = new FormData();

    formData.append('user-image', blob, 'image');

    this.http
      .post('http://localhost:51569/api/storage/save', formData, {
        responseType: 'text',
      })
      .subscribe((resp) => console.log(`image: ${resp}`));
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

  openModal(): void {
    this.modal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    if (this.video != null) {
      this.video.nativeElement.srcObject.getTracks()[0].stop();
      this.video.nativeElement.pause();

      this.userPhotoFromCamera = '';

      this.isShowCamera = false;
    }

    this.modal.nativeElement.style.display = 'none';
  }
}
