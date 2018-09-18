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

  private _showInLib = new Subject<Track>();
  showInLib$ = this._showInLib.asObservable();
  showInLib(track?: Track) {
    this._showInLib.next(track);
  }

  private _exploreRelated = new Subject<Track>();
  exploreRelated$ = this._exploreRelated.asObservable();
  exploreRelated(track?: Track) {
    this._exploreRelated.next(track);
  }
}