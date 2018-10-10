const containerId = 'ytContainer';

class ProxyPlayer {
  constructor() {
    this.track = null;
    this.player = new YT.Player(containerId, {
      width: '320',
      height: '240',
      events: {
        onReady: () => {
          console.log('YT Player ready');
        },
        onStateChange: () => {
          const playerState = this.player.getPlayerState();
          switch (playerState) {
            case -1:
              this.player.setPlaybackQuality('small');
              this.player.seekTo(0);
              this.player.unMute();
              break;

            case YT.PlayerState.PLAYING:
              sendMessage('onPlay', this.track);
              this.updateProgress();
              if (this.track.playlistId) {
                sendMessage('onPlaylistProgress', { playlist: this.player.getPlaylist(), playlistIndex: this.player.getPlaylistIndex() });
              }
              break;

            case YT.PlayerState.PAUSED:
              sendMessage('onPause', this.track);
              break;

            case YT.PlayerState.ENDED:
              const playlist = this.player.getPlaylist();
              if (playlist && playlist.length > 0) {
                if (this.player.getPlaylistIndex() == playlist.length - 1) {
                  sendMessage('onEnd');
                }
              } else {
                sendMessage('onEnd');
              }
              break;
          }
        },
        onError: (event) => {
          if (!this.track) {
            return;
          }
          if (this.track.playlistId) {
            this.next();
            return;
          }
          const errorCode = event.data;
          console.log('cannot play video. Error code:', errorCode);
          sendMessage('onError', 'Cannot play YouTube video. Error code: ' + getErrorMessage(errorCode));
        }
      }
    });
  }

  play(track) {
    if (!track) {
      throw 'Undefined track';
    }
    this.track = track;

    if (this.track.videoId) {
      this.player.loadVideoById(this.track.videoId, 0);
    } else if (this.track.playlistId) {
      this.player.loadPlaylist({ listType: 'playlist', list: this.track.playlistId });
    }
  }

  resume(track) {
    if (this.track && this.track.videoId == track.videoId) {
      this.player.playVideo();
    } else {
      throw 'Cannot resume video because the current track is different';
    }
  }

  pause() {
    if (YT.PlayerState.PLAYING != this.player.getPlayerState()) {
      throw 'INVALID STATE: ' + this.player.getPlayerState()
    }
    this.player.pauseVideo();
  }

  seek(time) {
    this.player.seekTo(time, true);
  }

  setVolume(volume) {
    this.player.setVolume(volume * 100);
  }

  next() {
    const playlist = this.player.getPlaylist();
    if (playlist) {
      const nextTrack = this.player.getPlaylistIndex() + 1;
      this.player.playVideoAt(nextTrack);
      if (nextTrack < playlist.length) {
        this.player.playVideoAt(nextTrack);
      } else {
        this.player.pauseVideo();
        sendMessage('onEnd');
      }
    }
  }

  prev() {
    const playlist = this.player.getPlaylist();
    if (playlist) {
      const prevTrack = this.player.getPlaylistIndex() - 1;
      if (prevTrack >= 0) {
        this.player.playVideoAt(prevTrack);
      } else {
        this.player.pauseVideo();
        sendMessage('onEnd');
      }
    }
  }

  updateProgress() {
    if (YT.PlayerState.PLAYING == this.player.getPlayerState()) {
      sendMessage('onProgress', { currentTime: this.player.getCurrentTime(), totalTime: this.player.getDuration() });
      setTimeout(() => this.updateProgress(), 1000); // update progress every 1 second
    }
  }
}

function sendMessage(event, data) {
  parent.postMessage({ event: event, data: data }, '*');
}

function onYouTubeIframeAPIReady() {
  console.log('onYouTubeIframeAPIReady');

  const proxyPlayer = new ProxyPlayer();
  window.addEventListener('message', function (message) {
    if (message.origin == 'https://www.youtube.com') {
      return;
    }
    const data = message.data;
    if (!data) {
      return;
    }
    const command = data.command;
    switch (command) {
      case 'play':
        console.debug('play command');
        proxyPlayer.play(data.data);
        break;

      case 'resume':
        console.debug('resume command');
        proxyPlayer.resume(data.data);
        break;

      case 'pause':
        console.debug('pause command');
        proxyPlayer.pause();
        break;

      case 'seek':
        console.debug('seek command');
        proxyPlayer.seek(data.data);
        break;

      case 'setVolume':
        console.debug('setVolume command');
        proxyPlayer.setVolume(data.data);
        break;

      case 'next':
        console.debug('next command');
        proxyPlayer.next();
        break;

      case 'prev':
        console.debug('prev command');
        proxyPlayer.prev();
        break;
    }
  });
}

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 100:
      return 'The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.';
    case 101:
    case 150:
      return 'The owner of the requested video does not allow it to be played in embedded players.';
    default:
      return 'The requested content cannot be played.';
  }
}