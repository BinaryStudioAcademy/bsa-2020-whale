import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.sass'],
})
export class TagComponent implements OnInit {
  @Input() email: string;
  @Input() displayValue: string;
  @Output() tagRemoved = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  public removeTag() {
    this.tagRemoved.emit(this.email);
  }
}
