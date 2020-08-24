import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appProgressBar]',
})
export class ProgressBarDirective implements OnInit {
  @Input('appProgressBar') progress: number;

  constructor(private el: ElementRef<HTMLDivElement>) {
    this.el.nativeElement.style.minWidth = '0px';
  }

  ngOnInit(): void {
    this.el.nativeElement.style.width = `${this.progress}%`;
  }
}
