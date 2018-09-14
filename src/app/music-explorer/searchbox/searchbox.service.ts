import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Runtime } from 'src/app/core';
import { SearchQuery } from '../music-explorer.model';

const apiUrl = 'https://suggestqueries.google.com/complete/search?hl=en&client=firefox&q=';

@Injectable()
export class SearchboxService {
  constructor(
    private httpClient: HttpClient,
    private runtime: Runtime
  ) {
    // const engine = this.runtime.engine;
    // const parentState = engine.state.explorer = engine.state.explorer || {};
    // this.state = parentState.searchBox = parentState.searchBox || new SearchboxState();
    this.state = new SearchboxState();
    const storage = this.getStorage();
    if (storage && storage.recentSearches) {
      this.state.recentSearches = storage.recentSearches;
    }
  }

  state: SearchboxState;

  getSuggestions(term: string): Observable<Suggestion[]> {
    term = term && term.trim();
    if (!term) {
      return of(this.state.recentSearches.map(e => ({ value: e, isHistory: true })));
    }
    return this.httpClient.get<any>(`${apiUrl}${term}`)
      .pipe(
        map(data => data[1].map(e => ({ value: e }))),
        catchError(e => {
          console.log('Error getting search suggestions', e);
          return of([]);
        })
      );
  }

  addRecentSearch(term: string) {
    term = term && term.trim();
    if (!term) {
      return;
    }
    // remove duplicates
    this.state.recentSearches = this.state.recentSearches.filter(e => e != term);
    this.state.recentSearches.unshift(term);

    // retain maximum 10 items
    if (this.state.recentSearches.length > 10) {
      this.state.recentSearches.slice(0, 9);
    }

    // sync storage
    this.getStorage().recentSearches = this.state.recentSearches;
    this.runtime.engine.syncStorage();
  }

  private getStorage(): { recentSearches: string[] } {
    return this.runtime.engine.storage.explorer = this.runtime.engine.storage.explorer || {};
  }
}

export class SearchboxState extends SearchQuery {
  suggestions: Suggestion[] = [];
  recentSearches: string[] = [];
}

export class Suggestion {
  value: string;
  isHistory?: boolean;
  active?: boolean;
}