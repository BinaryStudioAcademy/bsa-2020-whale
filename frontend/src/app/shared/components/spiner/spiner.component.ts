import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-spiner',
  templateUrl: './spiner.component.html',
  styleUrls: ['./spiner.component.sass'],
})
export class SpinerComponent {
  @Input() size: string;
  constructor() {}
}
