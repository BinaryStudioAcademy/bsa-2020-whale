import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SpinerComponent } from './components/spiner/spiner.component';
import { FormsModule } from '@angular/forms';
import { DateFormatPipe } from './pipes/date-format.pipe';

@NgModule({
  declarations: [PageHeaderComponent, SpinerComponent, DateFormatPipe],
  imports: [CommonModule, FormsModule],
  exports: [CommonModule, PageHeaderComponent, SpinerComponent, DateFormatPipe],
})
export class SharedModule {}
