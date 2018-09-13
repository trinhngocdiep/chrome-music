import * as Hls from 'hls.js';

export class NoisePlayer {

  private players = new Map();

  getPlayer(noise) {
    return this.players.get(noise.source);
  }

  play(noise) {
    let source = noise.source;
    let player = this.getPlayer(noise);
    if (!player) {
      let video = document.body.appendChild(document.createElement('video'));
      video.loop = true;
      player = { source: source, video: video };
      this.players.set(source, player);
    }
    player.enabled = true;
    let video = player.video;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.debug("playing noise with browser's native function");
      video.src = source;
      video.addEventListener('canplay', function () {
        video.play();
      });
      return;
    } else
      if (Hls.isSupported()) {
        console.debug('playing noise with hls.js');
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }
    console.error('cannot play noise', source);
  }

  stop(noise) {
    let player = this.getPlayer(noise);
    if (player) {
      player.video.pause();
      player.enabled = false;
    }
  }

  setVolume(noise, volume) {
    let player = this.getPlayer(noise);
    if (player) {
      player.video.volume = volume;
    }
  }
}