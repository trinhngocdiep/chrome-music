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

  player: MusicPlayer;
  trackProgress = { min: -1, max: 0, value: -1 };
  playlistProgress;

  ngOnInit() {
    this.engageEngine();
  }

  ngOnDestroy() {
    this.disengageEngine();
  }

  play() {
    this.playlistProgress = null;
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

    this.player.onPlay = (track) => {
      this.ngZone.run(() => {
        this.player.playing = true;
        this.trackProgress = { min: -1, max: 0, value: -1 };
        if (!track.playlistId) {
          this.playlistProgress = null;
        }
      });
    };

    this.player.onPause = () => {
      this.ngZone.run(() => {
        this.player.playing = false;
      });
    };

    this.player.onProgress = (track, currentTime, totalTime) => {
      this.ngZone.run(() => {
        this.player.playing = true;
        this.trackProgress = { min: 0, max: totalTime, value: currentTime };
      });
    };

    this.player.onPlaylistProgress = (track, playlist, index) => {
      console.debug('onPlaylistProgress', playlist.length, index)
      const total = playlist.length;
      this.ngZone.run(() => {
        track.durationInTrackCount = total;
        this.playlistProgress = { index, total };
      });
    };

    this.player.onEnd = () => {
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