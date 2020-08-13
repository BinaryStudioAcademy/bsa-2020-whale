import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlobService {
  constructor(private http: HttpClient) {}

  public baseUrl: string = environment.apiUrl;

  recorder: MediaRecorder;
  stream: MediaStream;

  public async startRecording(): Promise<void> {
    const mediaDevices = navigator.mediaDevices as any;
    this.stream = await mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
      audio: true,
    });

    this.recorder = new MediaRecorder(this.stream);

    const chunks = [];
    this.recorder.ondataavailable = (e: any) => chunks.push(e.data);
    this.recorder.onstop = (e: Event) => {
      const completeBlob = new Blob(chunks, { type: chunks[0].type });

      this.postBlob(completeBlob);
    };
    this.recorder.start();
  }

  public stopRecording(): void {
    this.recorder.stop();
    this.stream.getVideoTracks()[0].stop();
  }

  private postBlob(blob: Blob): void {
    const formData = new FormData();

    formData.append('meeting-record', blob, 'record');

    this.http
      .post(`${this.baseUrl}/api/storage/save`, formData, {
        responseType: 'text',
      })
      .subscribe((resp) => console.log(`video record: ${resp}`));
  }

  public postBlobUploadImage(blob: Blob): Observable<string> {
    const formData = new FormData();

    formData.append('user-image', blob, 'image');

    return this.http.post(`${this.baseUrl}/api/storage/save`, formData, {
      responseType: 'text',
    });
  }
}
