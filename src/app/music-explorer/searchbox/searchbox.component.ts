import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, switchMap, startWith, filter, tap } from 'rxjs/operators';

import { Track } from 'src/engine';
import { Navigation, View, EventBus } from 'src/app/core';
import { SearchQuery } from '../music-explorer.model';
import { SearchboxService, SearchboxState, Suggestion } from './searchbox.service';

@Component({
  selector: 'cm-explorer-searchbox',
  templateUrl: './searchbox.component.html',
  styleUrls: ['./searchbox.component.css'],
  providers: [SearchboxService]
})
export class SearchboxComponent implements OnInit {
  constructor(
    public navigation: Navigation,
    public eventBus: EventBus,
    private searchboxService: SearchboxService
  ) { }

  @Output() searchChange = new EventEmitter<SearchQuery>();
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild(MatAutocompleteTrigger) searchAutoCompleteTrigger: MatAutocompleteTrigger;

  sources = [
    { label: 'YouTube', value: 'yt' },
    { label: 'SoundClound', value: 'sc' }
  ];

  state: SearchboxState;
  suggestions: Observable<Suggestion[]>;

  ngOnInit() {
    this.eventBus.exploreRelated$
      .subscribe(e => {
        this.navigation.openExplorer();
        console.log('search related to', e);
        this.state.relatedTo = e;
      });

    this.state = this.searchboxService.state;
    this.suggestions = fromEvent<any>(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(400),
        map(e => e.target.value),
        distinctUntilChanged(),
        startWith(''),
        switchMap(e => this.searchboxService.getSuggestions(e))
      );
  }

  toggleSource(source: string, event) {
    event.stopPropagation();
    this.state[source] = !this.state[source];
    this.emitQueryChange();
  }

  acceptSearchTerm() {
    if (!this.searchAutoCompleteTrigger.activeOption) {
      this.searchAutoCompleteTrigger.closePanel();
    }
    this.searchboxService.addRecentSearch(this.state.term);
    this.emitQueryChange();
  }

  private emitQueryChange() {
    this.searchChange.emit({
      term: this.state.term,
      relatedTo: this.state.relatedTo,
      yt: this.state.yt,
      sc: this.state.sc
    });
  }
}