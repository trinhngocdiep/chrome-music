import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { SearchQuery } from '../music-explorer.model';
import { SearchboxService, SearchboxState, Suggestion } from './searchbox.service';
import { MatAutocompleteTrigger } from '@angular/material';

@Component({
  selector: 'cm-explorer-searchbox',
  templateUrl: './searchbox.component.html',
  styleUrls: ['./searchbox.component.css'],
  providers: [SearchboxService]
})
export class SearchboxComponent implements OnInit {
  constructor(private searchboxService: SearchboxService) { }

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
    this.state = this.searchboxService.state;
    this.suggestions = fromEvent<any>(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(400),
        map(e => e.target.value),
        distinctUntilChanged(),
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
      yt: this.state.yt,
      sc: this.state.sc
    });
  }
}