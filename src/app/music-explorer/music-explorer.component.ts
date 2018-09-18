import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { fromEvent, merge, of } from 'rxjs';
import { debounceTime, finalize, tap, switchMap, filter, first, catchError, startWith, concatMap } from 'rxjs/operators';

import { Track } from 'src/engine';
import { EventBus, Runtime, Navigation, View } from 'src/app/core';
import { SearchboxComponent } from './searchbox/searchbox.component';
import { MusicExplorerService } from './music-explorer.service';
import { SearchQuery, SearchResult } from './music-explorer.model';

@Component({
  selector: 'cm-music-explorer',
  templateUrl: './music-explorer.component.html',
  styleUrls: ['./music-explorer.component.css'],
  providers: [MusicExplorerService]
})
export class MusicExplorerComponent {
  constructor(
    private snackBar: MatSnackBar,
    private eventBus: EventBus,
    private navigation: Navigation,
    private runtime: Runtime,
    private musicExplorerService: MusicExplorerService
  ) { }

  @ViewChild('container') container: ElementRef;
  @ViewChild(SearchboxComponent) searchBox: SearchboxComponent;

  title: string;
  topLoaderVisible: boolean;
  botLoaderVisible: boolean;
  hasNoMoreData: boolean;
  content: SearchResult = new SearchResult();
  private query: SearchQuery;

  ngOnInit() {
    const filter$ = this.searchBox.searchChange
      .pipe(
        startWith(null),
        tap(query => {
          this.query = query || this.searchBox.state;
          this.content = new SearchResult();
          this.topLoaderVisible = true;
          setTimeout(() => this.scrollToTop());
        })
      );

    let isLoadingNext = false;
    const next$ = fromEvent<any>(this.container.nativeElement, 'scroll')
      .pipe(
        debounceTime(300),
        filter(() => !isLoadingNext),
        filter(e => e.target.scrollTop + e.target.clientHeight + 20 >= e.target.scrollHeight),
        tap(() => {
          isLoadingNext = true;
          this.botLoaderVisible = true;
        })
      );

    const fetch$ = merge(filter$, next$)
      .pipe(
        switchMap(() => {
          return this.musicExplorerService.search(this.query)
            .pipe(
              catchError(e => {
                console.log('Error search for tracks', e);
                this.snackBar.open('Something went wrong :\'(. Please try again later.');
                return of(SearchResult.empty());
              }),
              finalize(() => {
                this.topLoaderVisible = false;
                this.botLoaderVisible = false;
                isLoadingNext = false;
              })
            );
        })
      )

    this.navigation.navigate$
      .pipe(
        first(e => e == View.explorer),
        concatMap(() => fetch$)
      ).subscribe(result => {
        this.title = this.query && this.query.term ? 'Search result' : 'Trending';
        this.content.tracks = this.content.tracks.concat(result.tracks);
        this.query.offset = result.offset;
        this.hasNoMoreData = this.content.tracks.length > 0 && result.end;
      });
  }

  play(track: Track) {
    this.snackBar.open(`Playing ${track.title}`);
    this.runtime.engine.musicPlayer.play(track, true);
  }

  queue(track: Track) {
    this.snackBar.open(`Added to Now Playing queue`);
    this.runtime.engine.musicPlayer.queue([track]);
  }

  addToLib(track: Track) {
    this.snackBar.open(`Added to My Music`);
    this.eventBus.addToLib(track);
  }

  open(track: Track) {
    Runtime.openBrowserTab(track.sourceUrl);
  }

  scrollToTop() {
    this.container.nativeElement.scrollTop = 0;
  }
}