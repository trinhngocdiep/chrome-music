import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Track } from 'src/engine';
import { Runtime } from './runtime.service';

@Injectable({
  providedIn: 'root'
})
export class Navigation {
  private _navigate = new Subject<View>();
  navigate$ = this._navigate.asObservable()

  navigate(view: View) {
    this._navigate.next(view);
  }

  openSource(track: Track) {
    Runtime.openBrowserTab(track.sourceUrl);
  }

  openExplorer() {
    this.navigate(View.explorer);
  }

  openLibrary() {
    this.navigate(View.library);
  }

  openNoises() {
    this.navigate(View.noises);
  }
}

export class NavigationEvent {
  view: View;
  data?: any;
}

export enum View {
  nowPlaying = 0,
  library = 1,
  explorer = 2,
  noises = 3,
}