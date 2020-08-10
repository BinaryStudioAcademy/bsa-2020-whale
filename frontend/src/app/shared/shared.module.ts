import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SpinerComponent } from './components/spiner/spiner.component';



@NgModule({
  declarations: [
    ChatComponent, 
    PageHeaderComponent, 
    SpinerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    ChatComponent,
    PageHeaderComponent,
    SpinerComponent
  ]
})
export class SharedModule { }
