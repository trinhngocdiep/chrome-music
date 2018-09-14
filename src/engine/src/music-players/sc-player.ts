import { Player, PlayerListener } from './player';
import { Track } from '../track';

export class ScPlayer implements Player {
  constructor(private listener: PlayerListener) {
    this.audio.ontimeupdate = () => {
      listener.onProgress(this, this.audio.currentTime);
    };
    this.audio.onpause = () => {
      listener.onPause(this);
      if (this.audio.ended) {
        listener.onEnd(this);
      }
    };
    this.audio.onerror = (e) => {
      console.log('audio error', e);
      listener.onError(this, e.error);
    };
  }

  private audio: HTMLAudioElement = new Audio();

  canPlay(track: Track) {
    return !!track.stream_url;
  }

  play(track: Track) {
    if (!this.canPlay(track)) {
      return;
    }
    this.audio.src = track.stream_url;
    this.audio.play();
    this.listener.onPlay(this);
  }

  resume(track: Track) {
    if (!this.canPlay(track)) {
      return;
    }
    if (this.audio.src == track.stream_url) {
      this.audio.play();
      this.listener.onPlay(this);
    }
  }

  pause() {
    this.audio.pause();
  }

  seek(time) {
    this.audio.currentTime = time;
    if (this.audio.paused) {
      this.audio.play();
    }
  }

  setVolume(volume) {
    this.audio.volume = volume;
  };
}