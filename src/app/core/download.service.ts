import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Track } from 'src/engine';
import { Runtime } from './runtime.service';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

  download(track: Track): void {
    this.getDownloadUrl(track).subscribe(
      result => result && Runtime.download(result),
      () => this.snackBar.open('Download not available')
    );
  }

  getDownloadUrl(track: Track): Observable<{ url: string, filename: string }> {
    if (track && track.videoId) {
      return this.httpClient.get('https://www.youtube.com/get_video_info?video_id=' + track.videoId, { responseType: 'text' })
        .pipe(
          map(result => {
            const data = decodeURIComponent(result).split('&url_encoded_fmt_stream_map=')[1];
            const firstUrl = data.split('url=')[1].split('&itag')[0];
            return { url: decodeURIComponent(firstUrl), filename: sanitizeFileName(track.title) + '.mp4' };
          })
        );
    }
    if (track && track.stream_url) {
      return of({ url: track.stream_url, filename: sanitizeFileName(track.title) + '.mp3' });
    }
    return throwError('Download not supported:. Track info: ' + JSON.stringify(track));
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}