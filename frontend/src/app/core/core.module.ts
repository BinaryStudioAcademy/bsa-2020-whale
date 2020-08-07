import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  exports: [
  ],
  providers: [
    AuthService
  ]
})
export class CoreModule { }
