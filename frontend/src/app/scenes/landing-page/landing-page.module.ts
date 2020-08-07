import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SharedModule } from '@shared/shared.module';
import { ConfirmModalComponent} from './components/login-modal/login-modal.component';


@NgModule({
  declarations: [LandingPageComponent, ConfirmModalComponent],
  imports: [
    CommonModule
  ],
  providers: []

})
export class LandingPageModule { }
