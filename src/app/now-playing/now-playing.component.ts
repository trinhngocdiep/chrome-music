import { Component, NgZone, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { MusicPlayer } from 'src/engine';
import { Runtime, DownloadService, Navigation } from 'src/app/core';

@Component({
  selector: 'cm-now-playing',
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.css']
})
export class NowPlayingComponent {
  constructor(
    private ngZone: NgZone,
    private snackBar: MatSnackBar,
    private runtime: Runtime,
    public download: DownloadService,
    public navigation: Navigation,
  ) { }

  @ViewChild('progressBar') progressBar;

  player: MusicPlayer;

  ngOnInit() {
    this.engageEngine();
  }

  ngOnDestroy() {
    this.disengageEngine();
  }

  play() {
    this.player.play(this.player.currentTrack);
  }

  pause() {
    this.player.pause();
  }

  seek(time: number) {
    this.player.seek(time);
  }

  private engageEngine() {
    this.player = this.runtime.engine.musicPlayer;
    this.player.onPlay = () => {
      console.debug('onPlay');
      this.ngZone.run(() => {
        this.player.playing = true;
        // reset progress
        if (this.progressBar) {
          this.progressBar.min = -1;
          this.progressBar.max = 0;
          this.progressBar.value = -1;
        }
      });
    };
    this.player.onPause = () => {
      console.debug('onPause');
      this.ngZone.run(() => {
        this.player.playing = false;
      });
    };
    this.player.onProgress = (track, currentTime) => {
      console.debug('onProgress', currentTime);
      this.ngZone.run(() => {

        this.player.playing = true;

        // update progress bar's max and initial value
        if (this.progressBar && track.durationInSeconds) {
          this.progressBar.max = track.durationInSeconds;
          this.progressBar.value = currentTime;
        }
      });
    };
    this.player.onEnd = () => {
      console.debug('onEnd');
      this.ngZone.run(() => {
        this.player.playing = false;
      });
    };
    this.player.onError = (error) => {
      this.ngZone.run(() => {
        this.player.playing = false;
        this.snackBar.open(error || 'Cannot play track');
      });
    };
  }

  private disengageEngine() {
    this.player.removeListeners();
  }
}