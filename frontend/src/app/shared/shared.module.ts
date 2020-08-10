import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SpinerComponent } from './components/spiner/spiner.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PageHeaderComponent, SpinerComponent],
  imports: [CommonModule, FormsModule],
  exports: [CommonModule, PageHeaderComponent, SpinerComponent],
})
export class SharedModule {}
