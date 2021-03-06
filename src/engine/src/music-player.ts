import { Track } from './track';
import { Player, PlayerListener } from './music-players/player';
import { ScPlayer } from './music-players/sc-player';
import { YtPlayer } from './music-players/yt-player';

const autoPlayBackoffInterval = 1000;

export class MusicPlayer {

  volume: number = 1;

  private _playlist: Track[] = [];
  set playlist(value: Track[]) {
    this._playlist = value;
    this.onPlaylistChange && this.onPlaylistChange(value);
  }
  get playlist() { return this._playlist }

  private _currentTrack: Track;
  get currentTrack() { return this._currentTrack };

  repeatEnabled: boolean;
  shuffleEnabled: boolean;
  playing: boolean;

  // event listeners
  onPlay: (track: Track) => void;
  onEnd: Function;
  onPause: Function;
  onError: Function;
  onStatusChange: Function;
  onProgress: Function;
  onPlaylistProgress: Function;
  onPlaylistChange: Function;

  // propagates events from internal players to external listeners
  private playersMediator: PlayerListener = {
    onPlay: (player: Player) => {
      this.playing = true;
      this.currentTrack.error = null;
      this.onPlay && this.onPlay(this.currentTrack);
      this.onStatusChange && this.onStatusChange();
      player.setVolume(this.volume);
      if (player != this.currentPlayer) {
        console.log('player comeback', player);
        player.pause();
      }
    },
    onPause: (player: Player) => {
      this.playing = false;
      this.onPause && this.onPause(this.currentTrack);
      this.onStatusChange && this.onStatusChange();
    },
    onEnd: (player: Player) => {
      this.playing = false;
      this.onEnd && this.onEnd(this.currentTrack);
      this.onStatusChange && this.onStatusChange();
      if (this.repeatEnabled) {
        this.play(this.currentTrack);
      } else {
        this.next();
      }
    },
    onError: (player: Player, error: string) => {
      console.log(`Error playing track ${JSON.stringify(this.currentTrack)}`, error);
      this.playing = false;
      this.currentTrack.error = `[PLAY_ERROR] ${error || 'Track not playable'}`;
      this.onError && this.onError(error);
      this.onStatusChange && this.onStatusChange();

      // schedule an autoplay if there isn't one already
      if (!this.autoPlayScheduler) {
        console.log('creating scheduler after', this.autoPlayBackoffInterval);

        this.autoPlayScheduler = setTimeout(() => {
          console.log('executing scheduler', this.autoPlayScheduler);

          this.autoPlayScheduler = null;

          if (this.lastCommand == 'prev') {
            this.previous();
          } else {
            this.next();
          }
        }, this.autoPlayBackoffInterval);

        // increase the delay
        this.autoPlayBackoffInterval *= 2;
      }
    },
    onProgress: (player: Player, currentTime: number, totalTime: number) => {
      this.onProgress && this.onProgress(this.currentTrack, currentTime, totalTime);
    },
    onPlaylistProgress: (player: Player, playlist: string[], playlistIndex: number) => {
      this.onPlaylistProgress && this.onPlaylistProgress(this.currentTrack, playlist, playlistIndex);
    }
  };
  private players: Player[] = [new ScPlayer(this.playersMediator), new YtPlayer(this.playersMediator)];
  private currentPlayer: Player;
  private lastCommand: string;
  private autoPlayScheduler: any;
  private autoPlayBackoffInterval: number = autoPlayBackoffInterval;

  private resetAutoPlayScheduler() {
    console.log('resetAutoPlayScheduler');
    this.autoPlayBackoffInterval = autoPlayBackoffInterval;
    this.autoPlayScheduler && clearTimeout(this.autoPlayScheduler);
    this.autoPlayScheduler = null;
  }

  play(track: Track, force: boolean = false) {
    console.log('play');
    
    if (!force && track == this.currentTrack) {
      // resume the currently paused track
      if (!this.playing) {
        this.resume();
      }
      return;
    }

    const player = this.players.find(e => e.canPlay(track));
    if (!player) {
      this.onError && this.onError(`Track not playable ${track.title}`);
      return;
    }

    this.players.filter(e => e != player).forEach(e => e.pause());
    this._currentTrack = track;
    this.currentPlayer = player;
    player.play(track);
    if (force) {
      this.playlist = [track];
    }

    this.resetAutoPlayScheduler();
  }

  resume() {
    console.log('resume');
    this.currentPlayer && this.currentPlayer.resume(this.currentTrack);
    // this.resetAutoPlayScheduler();
  }

  pause() {
    this.currentPlayer && this.currentPlayer.pause();
    // this.resetAutoPlayScheduler();
  }

  next(skipPlaylist: boolean = true) {
    console.log('next');
    if (!this.currentTrack || !this.playlist || !this.playlist.length) {
      return;
    }
    if (!skipPlaylist && this.currentTrack.playlistId) {
      this.currentPlayer.next();
      return;
    }
    const currentIndex = this.playlist.indexOf(this.currentTrack);
    let nextTrack;
    if (this.shuffleEnabled) {
      nextTrack = this.playlist[getRandomNumberExcept(0, this.playlist.length - 1, currentIndex)];
    } else {
      nextTrack = this.playlist[currentIndex + 1];
    }
    this.play(nextTrack || this.playlist[0]);
  }

  previous(skipPlaylist: boolean = true) {
    if (!this.currentTrack || !this.playlist || !this.playlist.length) {
      return;
    }
    if (!skipPlaylist && this.currentTrack.playlistId) {
      this.currentPlayer.prev();
      this.lastCommand = 'prev';
      return;
    }
    const currentIndex = this.playlist.indexOf(this.currentTrack);
    let previousTrack = this.playlist[currentIndex - 1];
    if (!previousTrack) {
      previousTrack = this.playlist[this.playlist.length - 1];
    }
    if (previousTrack) {
      this.play(previousTrack);
      this.lastCommand = 'prev';
    }
  }

  setVolume(volume: number) {
    this.players.forEach(e => e.setVolume(volume));
  }

  seek(time: number) {
    if (this.currentPlayer) {
      this.currentPlayer.seek(time);
    }
  }

  queue(tracks: Track[]) {
    this.playlist = this.playlist.concat(tracks);

    // auto play
    if (!this.playing && !this.currentTrack) {
      this.play(tracks[0]);
    }
  }

  deque(track: Track) {
    const index = this.playlist.indexOf(track);
    if (index != -1) {
      this.playlist.splice(index, 1);
      this.playlist = this.playlist;
    }
  }

  removeListeners() {
    this.onPlay = null;
    this.onEnd = null;
    this.onPause = null;
    this.onError = null;
    this.onProgress = null;
    this.onStatusChange = null;
    this.onPlaylistChange = null;
  }
}

function getRandomNumberExcept(min, max, except) {
  // there's only one choice -- except
  if (except == min && except == max) {
    return except;
  }
  // random until a number different from the except is returned
  let random = except;
  do {
    random = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (random == except);
  return random;
}