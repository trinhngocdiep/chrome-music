import { Injectable } from '@angular/core';
import { Sort } from '@angular/material';
import { Observable, of } from 'rxjs';

import { Track } from 'src/engine';
import { Runtime, Searcher } from 'src/app/core';

@Injectable()
export class MusicManagerService {
  constructor(private runtime: Runtime) {
    this.tracks = (this.runtime.engine.storage.library || {}).tracks || [];
    this.tracks.forEach(e => Track.upgrade(e));
    this.updateIndex();
  }

  private index = new Searcher();
  private tracks: Track[];

  getTracks(filter: string, sort: Sort): Observable<Track[]> {
    return of(this.index.search(filter, sort));
  }

  add(track: Track): boolean {
    if (this.tracks.findIndex(e => e.sourceUrl === track.sourceUrl) < 0) {
      this.tracks.unshift(track);
      this.updateIndex();
      this.syncStorage();
      return true;
    }
    return false;
  }

  remove(track: Track) {
    this.tracks = this.tracks.filter(e => e != track);
    this.syncStorage();
  }

  private updateIndex() {
    this.index.updateIndex(this.tracks);
  }

  private syncStorage() {
    this.runtime.engine.storage.library = { tracks: this.tracks };
    this.runtime.engine.syncStorage();
  }
}