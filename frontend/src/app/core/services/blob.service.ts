import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlobService {
  constructor(private http: HttpClient) {}

  baseUrl: string = environment.apiUrl;
  recorder: MediaRecorder;
  stream: MediaStream;
  private recordReady = new Subject<string>();
  public recordReady$ = this.recordReady.asObservable();

  public startRecording(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const mediaDevices = navigator.mediaDevices as any;
      mediaDevices
        .getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true,
        })
        .then((stream: MediaStream) => {
          this.stream = stream;
          this.recorder = new MediaRecorder(stream);
          const chunks = [];
          this.recorder.ondataavailable = (e: any) => chunks.push(e.data);
          this.recorder.stream.getVideoTracks()[0].onended = () => {
            subscriber.next(false);
          };
          this.recorder.onstop = (e: Event) => {
            const blob = new Blob(chunks, { type: 'video/webm' });

            this.postBlob(blob).subscribe((resp) => {
              subscriber.complete();
              this.recordReady.next(resp);
            });
          };
          this.recorder.start();

          subscriber.next(true);
        })
        .catch(() => {
          subscriber.next(false);
        });
    });
  }

  public stopRecording(): void {
    this.recorder.stop();
    this.stream.getVideoTracks()[0].stop();
  }

  public postBlob(blob: Blob): Observable<string> {
    const formData = new FormData();

    formData.append('meeting-record', blob, 'record');

    return this.http.post(`${this.baseUrl}/api/storage/save`, formData, {
      responseType: 'text',
    });
  }

  public postBlobUploadImage(blob: Blob): Observable<string> {
    const formData = new FormData();

    formData.append('user-image', blob, 'image');

    return this.http.post(`${this.baseUrl}/api/storage/save`, formData, {
      responseType: 'text',
    });
  }

  public postBlobUploadAudio(blob: Blob): Observable<string> {
    const formData = new FormData();

    formData.append('user-audio', blob, 'auido');

    return this.http.post(`${this.baseUrl}/api/storage/save/mp3`, formData, {
      responseType: 'text',
    });
  }
}
