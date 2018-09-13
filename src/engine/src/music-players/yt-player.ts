import { Player, PlayerListener } from './player';
import { Track } from '../track';

const proxyUrl = 'https://hdmusic.neocities.org';

export class YtPlayer implements Player {
  constructor(private listener: PlayerListener) {
    window.onload = () => {
      console.debug('creating proxy', proxyUrl);
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '500';
      iframe.src = proxyUrl;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      this.proxy = iframe.contentWindow;
    };

    window.addEventListener('message', (message) => {
      console.debug('background player received message', message);
      const origin = message.origin;
      const data = message.data;
      // ignore messages from youtube iframe
      if (origin != proxyUrl) {
        return;
      }
      // dispatch messages from our proxy page
      this.dispatch(data.event, data.data);
    });
  }

  private proxy: Window;

  canPlay(track: Track) {
    return !!track.videoId || !!track.playlistId;
  }

  play(track: Track) {
    this.postMessageToProxy({ command: 'play', data: track });
  }

  resume(track: Track) {
    this.postMessageToProxy({ command: 'resume', data: track });
  }

  pause() {
    this.postMessageToProxy({ command: 'pause' });
  }

  seek(time) {
    this.postMessageToProxy({ command: 'seek', data: time });
  }

  setVolume(volume) {
    this.postMessageToProxy({ command: 'setVolume', data: volume });
  }

  private dispatch(event, data) {
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
        this.listener.onProgress(this, data);
        break;
      }
    }
  }

  private postMessageToProxy(message) {
    if (!this.proxy) {
      console.log('Proxy window is not ready');
      this.listener.onError(this, 'Player is not ready');
      return;
    }
    this.proxy.postMessage(message, '*');
  }
}