export class Track {
  title: string;
  durationInSeconds: number;
  source: string;
  sourceName: string;
  sourceUrl: string;
  artworkUrl: string;


  // UI stuff
  id?: string;
  error?: string;

  // deprecated data
  artwork_url?: string;

  // soundcloud
  stream_url?: string;

  // youtube
  videoId?: string;
  playlistId?: string;

  static upgrade(track: Track): void {
    track.id = track.id || newId();
    track.sourceName = track.sourceName || (track.source == 'sc' ? 'SoundCloud' : 'YouTube');
    track.artworkUrl = track.artworkUrl || track.artwork_url;
  }
}

function newId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return 'track' + '-' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}