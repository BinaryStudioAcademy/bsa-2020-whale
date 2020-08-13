import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SharedModule } from '@shared/shared.module';
import { AddContactModalComponent } from './components/add-contact-modal/add-contact-modal.component';
import { FormsModule } from '@angular/forms';
import { ContactsChatComponent } from './components/contacts-chat/contacts-chat.component';
import { CallModalComponent } from './components/call-modal/call-modal.component';

@NgModule({
  declarations: [
    HomePageComponent,
    AddContactModalComponent,
    ContactsChatComponent,
    CallModalComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
  entryComponents: [CallModalComponent],
})
export class HomePageModule {}
