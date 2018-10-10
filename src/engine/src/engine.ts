import { MusicPlayer } from './music-player';
import { NoisePlayer } from './noise-player';
import { UserStorage } from './user-storage';
import { Track } from './track';

export class Engine {
  constructor() {
  }
  musicPlayer: MusicPlayer = new MusicPlayer();
  noisePlayer: NoisePlayer = new NoisePlayer();
  storage: any = {};
  state: any = {};
  ready = false;
  onReady?: (engine: Engine) => void;

  private userStorage = new UserStorage((data) => {
    this.storage = data;
    this.ready = true;
    this.onReady && this.onReady(this);
  });

  playAllMusic(): boolean {
    const library = this.storage.library;
    const tracks: Track[] = library && library.tracks;
    if (tracks && tracks.length > 0) {
      this.musicPlayer.playlist = tracks.concat();
      this.musicPlayer.play(tracks[0]);
      return true;
    }
    return false;
  }

  syncStorage() {
    console.log('syncStorage')
    this.userStorage.sync();
  }
}