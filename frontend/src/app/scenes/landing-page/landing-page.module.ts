import { NgModule } from '@angular/core';

import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [LandingPageComponent],
  imports: [
    SharedModule
  ]
})
export class LandingPageModule { }
