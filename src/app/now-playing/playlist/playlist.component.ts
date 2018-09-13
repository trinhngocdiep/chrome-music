import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, BehaviorSubject, merge, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, map, startWith, filter } from 'rxjs/operators';

import { EventBus, Runtime, Navigation, View, DownloadService } from 'src/app/core';
import { Track, MusicPlayer } from 'src/engine';
import { PlaylistService } from './playlist.service';

@Component({
  selector: 'cm-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
  providers: [PlaylistService]
})
export class PlaylistComponent implements OnInit {

  constructor(
    private elementRef: ElementRef,
    private runtime: Runtime,
    private eventBus: EventBus,
    private playlistService: PlaylistService,
    public navigation: Navigation,
    public download: DownloadService,
  ) { }

  player: MusicPlayer;
  sort$ = new BehaviorSubject<string>('asc');
  filteredList: Track[];
  hasPlaylist: boolean;
  filter: string;

  private playlist$ = new Subject<Track[]>();

  @ViewChild('searchInput') searchInput: ElementRef;

  ngOnInit() {
    this.playlist$.subscribe(e => {
      this.playlistService.updatePlaylist(e);
      this.filteredList = e;
      this.hasPlaylist = e && e.length > 0;
    });

    const player = this.player = this.runtime.engine.musicPlayer;
    this.playlist$.next(player.playlist);
    player.onPlay = () => this.scrollToActiveTrack();
    player.onPlaylistChange = e => {
      this.playlist$.next(e);
    };

    const filter$ = fromEvent<any>(this.searchInput.nativeElement, 'input')
      .pipe(
        map(e => e.target.value),
        distinctUntilChanged()
      );

    merge(this.sort$, filter$)
      .pipe(
        debounceTime(200),
        startWith(null)
      ).subscribe(() => {
        this.filteredList = this.playlistService.getPlaylist(this.filter, this.sort$.value);
      });

    this.navigation.navigate$.pipe(filter(e => e == View.nowPlaying)).subscribe(() => this.scrollToActiveTrack());
  }

  ngAfterViewInit() {
    this.scrollToActiveTrack();
  }

  sort() {
    let sortType = this.sort$.value;
    if (sortType == 'asc') {
      sortType = 'desc';
    } else {
      sortType = 'asc';
    }
    this.sort$.next(sortType);
  }

  play(track: Track) {
    this.player.play(track);
  }

  remove(track: Track) {
    this.player.deque(track);
  }

  findInLib(track: Track) {
    this.eventBus.showLib(track);
  }

  addToLib(track: Track) {
    this.eventBus.addToLib(track);
  }

  playAll() {
    if (!this.runtime.engine.playAllMusic()) {
      this.navigation.openExplorer();
    }
  }

  private scrollToActiveTrack() {
    setTimeout(() => {
      const el: HTMLElement = this.elementRef.nativeElement.querySelector('.track_active');
      if (el && !isScrolledIntoView(el)) {
        el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      }
    });
  }

  // findRelatedTracks() {
  // // first, populate the list with the selected item and then play it.
  // this.player.playlist = [track];
  // this.play(track);

  // // populate the list with related items when they become available.
  // this.apiService.getRelatedTracks(track)
  //   .subscribe(data => {
  //     if (data.tracks.length > 0) {
  //       this.player.playlist = this.player.playlist.concat(data.tracks);
  //       this.play(track);
  //     }
  //   });
  // }
}

function isScrolledIntoView(el) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;
  return (elemTop >= 0) && (elemBottom <= window.innerHeight);
}