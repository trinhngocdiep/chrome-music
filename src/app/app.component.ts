import { Component, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';

import { EventBus, Navigation, Runtime } from 'src/app/core';

@Component({
  selector: 'cm-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private runtime: Runtime, // import to initialize
    private eventBus: EventBus,
    private navigation: Navigation
  ) { }

  @ViewChild('tabGroup') set tabGroup(tabGroup: MatTabGroup) {
    if (tabGroup) {
      tabGroup.selectedTabChange.subscribe(e => this.navigation.navigate(e.index));
      this.navigation.navigate$.subscribe(tabIndex => {
        tabGroup.selectedIndex = tabIndex;
      });
    }
  }

  ready: boolean = false;

  ngOnInit() {
    this.eventBus.appReady$.subscribe(e => this.ready = e);
  }
}
