import { Track } from '../track';

export interface Player {
  canPlay(track: Track);
  play(track: Track);
  resume(track: Track);
  pause();
  setVolume(volume: number);
  seek(time: number);
}

export class PlayerListener {
  onProgress: (player: Player, currentTime: number) => void;
  onPlay: (player: Player) => void;
  onPause: (player: Player) => void;
  onEnd: (player: Player) => void;
  onError: (player: Player, error: string) => void;
}