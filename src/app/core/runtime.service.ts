import { Injectable, NgZone } from '@angular/core';

import { Engine } from 'src/engine';
import { EventBus } from './event-bus.service';

declare const chrome;

@Injectable({
  providedIn: 'root'
})
export class Runtime {
  constructor(
    private ngZone: NgZone,
    private eventBus: EventBus
  ) { this.init() }

  engine: Engine;

  static openBrowserTab(url) {
    if (!url) {
      return;
    }
    if (chrome.extension) {
      chrome.tabs.create({ url: url });
    } else {
      window.open(url, '_blank');
    }
  }

  static download(result) {
    if (chrome && chrome.downloads) {
      chrome.downloads.download(result);
    } else {
      window.open(result.url, '_blank');
    }
  }

  private init() {
    const engine: Engine = (chrome && chrome.extension && chrome.extension.getBackgroundPage().engine || window['engine']);
    if (engine.ready) {
      this.onEngineReady(engine);
    } else {
      engine.onReady = (e) => {
        this.ngZone.run(() => this.onEngineReady(e));
      }
    }
  }

  private onEngineReady(engine) {
    this.engine = engine;
    this.eventBus.appReady();
  }
}