import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { fromEvent, merge, of, Subject } from 'rxjs';
import { debounceTime, finalize, tap, switchMap, filter, catchError, startWith } from 'rxjs/operators';

import { Track } from 'src/engine';
import { EventBus, Runtime, Navigation } from 'src/app/core';
import { SearchResult, SearchQuery } from '../music-explorer.model';
import { MusicExplorerService } from '../music-explorer.service';

@Component({
  selector: 'cm-related-explorer',
  templateUrl: './related-explorer.component.html',
  styleUrls: ['./related-explorer.component.css'],
})
export class RelatedExplorerComponent {

  constructor(
    private snackBar: MatSnackBar,
    public eventBus: EventBus,
    private runtime: Runtime,
    private musicExplorerService: MusicExplorerService
  ) { }

  @ViewChild('container') container: ElementRef;
  @Input() baseTrack: Track;
  @Output('close') close = new EventEmitter<void>();

  topLoaderVisible: boolean;
  botLoaderVisible: boolean;
  hasNoMoreData: boolean;
  content: SearchResult;
  private query: SearchQuery;
  private refresh$ = new Subject<void>();

  ngOnChanges() {
    this.refresh$.next();
  }

  ngOnInit() {
    const first$ = this.refresh$
      .pipe(
        startWith(null),
        tap(() => {
          this.topLoaderVisible = true;
          this.query = { baseTrack: this.baseTrack };
          this.content = new SearchResult();
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

    merge(first$, next$)
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
      ).subscribe(result => {
        this.content.tracks = this.content.tracks.concat(result.tracks);
        this.query.offset = result.offset;
        this.hasNoMoreData = this.content.tracks.length > 0 && result.end;
      });
  }

  back() {
    this.close.emit();
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
