import { Player, PlayerListener } from './player';
import { Track } from '../track';

const proxyUrl = 'https://hdmusic.neocities.org';
// const proxyUrl = 'http://localhost:8080/yt-proxy.html';

export class YtPlayer implements Player {
  constructor(private listener: PlayerListener) {
    this.createProxy();
  }

  private proxy: Window;

  canPlay(track: Track) {
    return !!track.videoId || !!track.playlistId;
  }

  play(track: Track) {
    this.sendMessage('play', track);
  }

  resume(track: Track) {
    this.sendMessage('resume', track);
  }

  pause() {
    this.sendMessage('pause');
  }

  seek(time) {
    this.sendMessage('seek', time);
  }

  setVolume(volume) {
    this.sendMessage('setVolume', volume);
  }

  next() {
    this.sendMessage('next');
  }

  prev() {
    this.sendMessage('prev');
  }

  private createProxy() {
    console.log('creating proxy', proxyUrl);
    window.onload = () => {
      const iframe = document.createElement('iframe');
      iframe.src = proxyUrl;
      iframe.width = '100%';
      iframe.height = '400';
      // iframe.style.display = 'none';
      iframe.onload = () => {
        console.log('proxy ready');
        this.proxy = iframe.contentWindow;
      }
      document.body.appendChild(iframe);
    }
    window.addEventListener('message', (message) => this.handleMessage(message));
  }

  private handleMessage(message) {
    // ignore messages from youtube iframe
    const messageOrigin = message.origin;
    if (messageOrigin != proxyUrl) {
      return;
    }
    const messageData = message.data;
    const event = messageData.event;
    const data = messageData.data;
    switch (event) {
      case 'onPlay': {
        this.listener.onPlay(this);
        break;
      }
      case 'onPause': {
        this.listener.onPause(this);
        break;
      }
      case 'onEnd': {
        this.listener.onEnd(this);
        break;
      }
      case 'onError': {
        this.listener.onError(this, data);
        break;
      }
      case 'onProgress': {
        this.listener.onProgress(this, data.currentTime, data.totalTime);
        break;
      }
      case 'onPlaylistProgress':
        this.listener.onPlaylistProgress(this, data.playlist, data.playlistIndex);
        break;
    }
  }

  private sendMessage(command: string, data?: any) {
    if (!this.proxy) {
      console.log('Proxy window is not ready');
      this.listener.onError(this, 'Player is not ready yet');
      return;
    }
    this.proxy.postMessage({ command: command, data: data }, '*');
  }
}