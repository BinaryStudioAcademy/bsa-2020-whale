import { Component, OnInit, OnDestroy } from '@angular/core';
import { error } from '@angular/compiler/src/util';
@Component({
  selector: 'app-setting-page',
  templateUrl: './setting-page.component.html',
  styleUrls: ['./setting-page.component.sass'],
})
export class SettingPageComponent implements OnInit, OnDestroy {
  isVideo = false;
  isAudio = true;
  constructor() {}
  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.changeAudio();
  }
  // tslint:disable-next-line: typedef
  changeVideo() {
    this.isVideo = true;
    this.isAudio = false;
    document.getElementById('audioHeader').style.background = '#FFFFFF';
    document.getElementById('videoHeader').style.background = '#dbdbdb';
  }
  // tslint:disable-next-line: typedef
  changeAudio() {
    this.isVideo = false;
    this.isAudio = true;
    document.getElementById('videoHeader').style.background = '#FFFFFF';
    document.getElementById('audioHeader').style.background = '#dbdbdb';
  }
}
