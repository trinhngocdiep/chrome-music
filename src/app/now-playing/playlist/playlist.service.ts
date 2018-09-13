import { Injectable } from '@angular/core';
import * as fuzzysort from 'fuzzysort';

import { Track } from 'src/engine';

@Injectable()
export class PlaylistService {

  private index: Fuzzysort.Fuzzysort = fuzzysort.new({ allowTypo: true, threshold: -100 });
  private tracks: Track[] = [];

  updatePlaylist(tracks: Track[]) {
    this.tracks = tracks;
  }

  getPlaylist(filter: string, sort: string): Track[] {
    return this.sort(this.filter(this.tracks, filter), sort);
  }

  private filter(tracks: Track[], filter: string): Track[] {
    filter = filter && filter.trim();
    if (!filter) {
      return tracks;
    }
    return this.index.go(filter, tracks, { key: 'title' }).map(e => e.obj);
  }

  private sort(tracks: Track[], sortType: string): Track[] {
    switch (sortType) {
      case 'asc':
        return tracks.sort((a, b) => a.title.localeCompare(b.title));
      case 'desc':
        return tracks.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return tracks;
    }
  }
}
