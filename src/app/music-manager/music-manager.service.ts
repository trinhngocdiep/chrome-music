import { Injectable } from '@angular/core';
import { Sort } from '@angular/material';
import { Observable, of } from 'rxjs';
import * as fuzzysort from 'fuzzysort';

import { Track } from 'src/engine';
import { Runtime } from 'src/app/core';

@Injectable()
export class MusicManagerService {
  constructor(private runtime: Runtime) { this.init() }

  tracks: Track[];

  private index: Fuzzysort.Fuzzysort;

  getTracks(filter: string, sort: Sort): Observable<Track[]> {
    return of(this.sort(this.filter(this.tracks, filter), sort));
  }

  add(track: Track): boolean {
    if (this.tracks.findIndex(e => e.sourceUrl === track.sourceUrl) < 0) {
      this.tracks.unshift(track);
      this.syncStorage();
      return true;
    }
    return false;
  }

  remove(tracks: Track[]) {
    this.tracks = this.tracks.filter(e => !tracks.includes(e));
    this.syncStorage();
  }

  private init() {
    this.tracks = (this.runtime.engine.storage.library || {}).tracks || [];
    this.tracks.forEach(e => Track.upgrade(e));
  }

  private syncStorage() {
    this.runtime.engine.storage.library = { tracks: this.tracks };
    this.runtime.engine.syncStorage();
  }

  private filter(tracks: Track[], filter: string): Track[] {
    filter = filter && filter.trim();
    if (!filter) {
      return tracks;
    }
    if (!this.index) {
      this.index = fuzzysort.new({ allowTypo: true, threshold: -100 });
    }
    return this.index.go(filter, tracks, { key: 'title' }).map(e => e.obj);
  }

  private sort(tracks: Track[], sort: Sort): Track[] {
    if (!sort) {
      return tracks;
    }
    switch (sort.direction) {
      case 'asc':
        if (sort.active == 'durationInSeconds') {
          return tracks.sort((a, b) => a.durationInSeconds - b.durationInSeconds);
        }
        return tracks.sort((a, b) => a.title.localeCompare(b.title));
      case 'desc':
        if (sort.active == 'durationInSeconds') {
          return tracks.sort((b, a) => a.durationInSeconds - b.durationInSeconds);
        }
        return tracks.sort((b, a) => a.title.localeCompare(b.title));
    }
    return tracks;
  }
}