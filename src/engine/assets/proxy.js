(function () {
  class ProxyPlayer {
    constructor() {
      this.containerId = 'ytContainer';
      this.player = {};
      this.track = null;
    }

    play(track) {
      if (!track) {
        postToParent({ event: 'onError', data: 'Error playing video: Undefined track info.' });
        return;
      }
      this.track = track;
      if (this.player.playVideo) {
        if (this.track.videoId) {
          this.player.loadVideoById(this.track.videoId, 0);
        } else if (this.track.playlistId) {
          this.player.loadPlaylist({ listType: 'playlist', list: this.track.playlistId });
        }
      } else {
        let playerOptions = {
          height: '400',
          width: '400',
          events: {
            onReady: () => {
              console.log('onReady');
              this.player.playVideo();
              postToParent({ event: 'onPlay' });
            },
            onStateChange: () => {
              let playerState = this.player.getPlayerState();
              console.log('onReady', playerState);
              if (playerState == YT.PlayerState.PLAYING) {
                postToParent({ event: 'onPlay' });
                this.updateProgress();
              } else if (playerState == YT.PlayerState.PAUSED) {
                postToParent({ event: 'onPause', data: this.track });
              } else if (playerState == YT.PlayerState.ENDED) {
                let playlist = this.player.getPlaylist && this.player.getPlaylist();
                if (playlist && playlist.length > 0) {
                  if (this.player.getPlaylistIndex() == playlist.length - 1) {
                    postToParent({ event: 'onEnd' });
                  }
                } else {
                  postToParent({ event: 'onEnd' });
                }
              }
            },
            onError: (event) => {
              console.log('cannot play video. Error code:', event.data);
              let errorMessage = 'The requested content cannot be played.';
              switch (event.data) {
                case 100:
                  errorMessage = 'The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.';
                  break;
                case 101:
                case 150:
                  errorMessage = 'The owner of the requested video does not allow it to be played in embedded players.';
                  break;
              }
              postToParent({ event: 'onError', data: 'Cannot play YouTube video. Error code: ' + errorMessage });
            }
          },
          videoId: this.track.videoId
        };
        if (this.track.videoId) {
          playerOptions.videoId = this.track.videoId;
        } else if (this.track.playlistId) {
          playerOptions.playerVars = { listType: 'playlist', list: this.track.playlistId };
        }
        this.player = new YT.Player(this.containerId, playerOptions);
      }
    }

    resume(track) {
      //let playerState = this.player.getPlayerState();
      //if (playerState == YT.PlayerState.ENDED || playerState == YT.PlayerState.PAUSED) {
      if (this.track && this.track.videoId == track.videoId) {
        this.player.playVideo();
      } else {
        postToParent({ event: 'onError', data: 'cannot resume video because the current track is different' });
      }
      //} else {
      //    postToParent({event: 'onError', data: 'cannot resume video because its state is: ' + playerState});
      //}
    }

    pause() {
      this.player.pauseVideo && this.player.pauseVideo();
    }

    seek(time) {
      this.player.seekTo && this.player.seekTo(time, true);
    }

    setVolume(volume) {
      if (this.player.setVolume) {
        // setVolume does not unmute the video. WTF!
        this.player.unMute();
        this.player.setVolume(volume * 100)
      }
    }

    updateProgress() {
      if (YT.PlayerState.PLAYING == this.player.getPlayerState()) {
        postToParent({ event: 'onProgress', data: this.player.getCurrentTime() });
        setTimeout(() => this.updateProgress(), 1000); // update progress every 1 second
      }
    }
  }

  let ytPlayer = new ProxyPlayer();
  console.log('proxy listening to message');
  window.addEventListener("message", function (message) {
    if (message.origin == 'https://www.youtube.com') {
      console.debug('proxy received message', message);
      return;
    }
    console.log('proxy received message', message);
    let data = message.data;
    if (!data) {
      return;
    }
    let command = data.command;
    switch (command) {
      case 'play': {
        console.log('play command');
        ytPlayer.play(data.data);
        break;
      }
      case 'resume': {
        console.log('resume command');
        ytPlayer.resume(data.data);
        break;
      }
      case 'pause': {
        console.log('pause command');
        ytPlayer.pause();
        break;
      }
      case 'seek': {
        console.log('seek command');
        ytPlayer.seek(data.data);
        break;
      }
      case 'setVolume': {
        console.log('setVolume command');
        ytPlayer.setVolume(data.data);
        break;
      }
    }
  });

  function postToParent(message) {
    console.debug('postToParent', message);
    parent.postMessage(message, '*');
  }
})();