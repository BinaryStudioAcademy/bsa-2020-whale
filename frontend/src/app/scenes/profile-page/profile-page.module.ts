import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { SharedModule } from '@shared/shared.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ProfilePageComponent],
  imports: [CommonModule, SharedModule, ImageCropperModule, FormsModule],
})
export class ProfilePageModule {}
