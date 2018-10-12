import * as Hls from 'hls.js';

export enum NoiseType {
  seaside = 'https://cdn.noisli.com/hls/seaside/seaside.m3u8',
  forest = 'https://cdn.noisli.com/hls/forest/forest.m3u8',
  rain = 'https://cdn.noisli.com/hls/rain/rain.m3u8',
  thunder = 'https://cdn.noisli.com/hls/thunderstorm/thunderstorm.m3u8',
  fire = 'https://cdn.noisli.com/hls/fire/fire.m3u8',
  summer = 'https://cdn.noisli.com/hls/summernight/summernight.m3u8',
  wind = 'https://cdn.noisli.com/hls/wind/wind.m3u8',
  leaves = 'https://cdn.noisli.com/hls/leaves/leaves.m3u8',
}

export class NoisePlayer {

  muted: boolean;

  private noises = new Map<NoiseType, Noise>();

  getNoise(type: NoiseType): Noise {
    let noise = this.noises.get(type);
    if (!noise) {
      noise = new Noise(type);
      this.noises.set(type, noise);
    }
    return noise;
  }

  toggleNoise(type: NoiseType) {
    const noise = this.getNoise(type);

    if (!noise.playing) {
      noise.play();
    } else {
      noise.stop();
    }

    // unmute all others
    if (this.muted) {
      this.toggleMuted();
    }
  }

  toggleMuted() {
    this.muted = !this.muted;
    this.noises.forEach(e => {
      if (this.muted) {
        e.pause();
      } else {
        e.resume();
      }
    });
  }

}

export class Noise {
  constructor(public type: NoiseType) {
    this.source = type;
    this.video = document.body.appendChild(document.createElement('video'));
    this.video.loop = true;
  }
  private source: string;

  private _playing: boolean;
  get playing() { return this._playing }

  private wasPlaying: boolean;

  private _volume: number = 0.3;
  get volume() { return this._volume };
  set volume(value) {
    this._volume = value;
    this.video.volume = value;
  }

  private hls: Hls;
  private video: HTMLVideoElement;
  private loaded: boolean;

  play() {
    if (!this.hls) {
      this.hls = new Hls();
      this.hls.loadSource(this.source);
      this.hls.attachMedia(this.video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.loaded = true;
        this.doPlay();
      });
    } else if (this.loaded) {
      this.doPlay();
    } else {
      throw 'Player not ready';
    }
  }

  stop() {
    this.video.pause();
    this._playing = false;
    this.wasPlaying = false;
  }

  pause() {
    if (this._playing) {
      this.video.pause();
      this._playing = false;
      this.wasPlaying = true;
    }
  }

  resume() {
    if (this.wasPlaying) {
      this.video.play();
      this._playing = true;
    }
  }

  private doPlay() {
    if (this.video && this.loaded) {
      this.video.play();
      this.video.volume = this.volume;
      this._playing = true;
      this.wasPlaying = true;
    }
  }
}