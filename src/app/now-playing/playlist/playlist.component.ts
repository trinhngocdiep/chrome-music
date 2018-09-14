import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SortDirection } from '@angular/material';
import { fromEvent, merge, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, map, startWith, filter } from 'rxjs/operators';

import { Track, MusicPlayer } from 'src/engine';
import { EventBus, Runtime, Navigation, View, DownloadService, Searcher } from 'src/app/core';

@Component({
  selector: 'cm-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {

  constructor(
    private elementRef: ElementRef,
    private runtime: Runtime,
    private eventBus: EventBus,
    public navigation: Navigation,
    public download: DownloadService,
  ) { }

  player: MusicPlayer;
  filter: string;
  sortDirection: SortDirection;
  visibleTracks: Track[];
  hasPlaylist: boolean;

  private playlist$ = new Subject<Track[]>();
  private sort$ = new Subject<void>();
  private index = new Searcher();

  @ViewChild('searchInput') searchInput: ElementRef;

  ngOnInit() {
    this.player = this.runtime.engine.musicPlayer;    
    this.player.onPlaylistChange = tracks => this.playlist$.next(tracks);
    this.player.onPlaylistChange(this.player.playlist); // initialize the playlist

    this.playlist$.subscribe(tracks => {
      this.index.updateIndex(tracks);
      this.hasPlaylist = tracks && tracks.length > 0;
    });
    
    const filter$ = fromEvent<any>(this.searchInput.nativeElement, 'input')
      .pipe(
        map(e => e.target.value),
        distinctUntilChanged()
      );

    merge(this.playlist$, filter$, this.sort$)
      .pipe(
        startWith(null),
        debounceTime(200),
        map(() => this.index.search(this.filter, { active: 'title', direction: this.sortDirection }))
      ).subscribe(e => this.visibleTracks = e);

    this.navigation.navigate$.pipe(filter(e => e == View.nowPlaying)).subscribe(() => this.scrollToActiveTrack());
  }

  ngAfterViewInit() {
    this.scrollToActiveTrack();
  }

  sort() {
    if (this.sortDirection == 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortDirection = 'asc';
    }
    this.sort$.next();
  }

  play(track: Track) {
    this.player.play(track);
  }

  remove(track: Track) {
    this.player.deque(track);
  }

  addToLib(track: Track) {
    this.eventBus.addToLib(track);
  }

  findInLib(track: Track) {
    this.eventBus.showLib(track);
  }

  findInExplorer(track: Track) {
    this.eventBus.exploreMoreTrack(track);
  }

  playAll() {
    if (!this.runtime.engine.playAllMusic()) {
      this.navigation.openExplorer();
    }
  }
  
  private scrollToActiveTrack() {
    setTimeout(() => {
      const el: HTMLElement = this.elementRef.nativeElement.querySelector('.track .track__play-indicator');
      if (el && !isScrolledIntoView(el)) {
        el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      }
    });
  }
}

function isScrolledIntoView(el) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;
  return (elemTop >= 0) && (elemBottom <= window.innerHeight);
}