import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { Track } from 'src/engine';

@Injectable({
  providedIn: 'root'
})
export class EventBus {

  private _appReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  appReady$ = this._appReady.asObservable();
  appReady() {
    this._appReady.next(true);
  }

  private _addToLib = new Subject<Track>();
  addToLib$ = this._addToLib.asObservable();
  addToLib(track?: Track) {
    this._addToLib.next(track);
  }

  private _showLib = new Subject<Track>();
  showLib$ = this._showLib.asObservable();
  showLib(track?: Track) {
    this._showLib.next(track);
  }

  private _exploreMoreTrack = new Subject<Track>();
  exploreMoreTrack$ = this._exploreMoreTrack.asObservable();
  exploreMoreTrack(track: Track) {
    this._exploreMoreTrack.next(track);
  }
}