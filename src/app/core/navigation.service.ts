import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Track } from 'src/engine';
import { Runtime } from './runtime.service';

@Injectable({
  providedIn: 'root'
})
export class Navigation {
  private _navigate = new Subject<View>();
  navigate$ = this._navigate.asObservable();

  navigate(view: View) {
    this._navigate.next(view);
  }

  openSource(track: Track) {
    Runtime.openBrowserTab(track.sourceUrl);
  }

  openExplorer() {
    this._navigate.next(View.explorer);
  }

  openLibrary() {
    this._navigate.next(View.library);
  }

  openNoises() {
    this._navigate.next(View.noises);
  }
}

export enum View {
  nowPlaying = 0,
  library = 1,
  explorer = 2,
  noises = 3,
}