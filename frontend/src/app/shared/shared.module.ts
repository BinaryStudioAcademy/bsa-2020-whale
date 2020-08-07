import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';



@NgModule({
  declarations: [ChatComponent, PageHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    ChatComponent,
    PageHeaderComponent
  ]
})
export class SharedModule { }
