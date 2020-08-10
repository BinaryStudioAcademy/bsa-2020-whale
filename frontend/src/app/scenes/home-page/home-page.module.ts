import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SharedModule } from '@shared/shared.module';
import { AddContactModalComponent } from './components/add-contact-modal/add-contact-modal.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [HomePageComponent, AddContactModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ]
})
export class HomePageModule { }