import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatSort, MatTable, MatSnackBar, MatTableDataSource } from '@angular/material';
import { fromEvent, BehaviorSubject, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, startWith, filter, first, concatMap } from 'rxjs/operators';

import { Track, MusicPlayer } from 'src/engine';
import { EventBus, Runtime, Navigation, DownloadService, View } from 'src/app/core';
import { MusicManagerService } from './music-manager.service';

@Component({
  selector: 'cm-music-manager',
  templateUrl: './music-manager.component.html',
  styleUrls: ['./music-manager.component.css'],
  providers: [MusicManagerService]
})
export class MusicManagerComponent {
  constructor(
    private elementRef: ElementRef,
    private snackBar: MatSnackBar,
    private runtime: Runtime,
    private musicManagerService: MusicManagerService,
    public eventBus: EventBus,
    public navigation: Navigation,
    public download: DownloadService,
  ) { }

  @ViewChild('filterInput') filterInput: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['title', 'durationInSeconds', 'ui-action'];
  isEmpty: boolean;
  player: MusicPlayer;
  filter: string;
  filteredTracks: Track[] = [];

  private refresh$ = new Subject<void>();

  ngOnInit() {
    this.player = this.runtime.engine.musicPlayer;

    this.eventBus.addToLib$.subscribe(track => {
      if (this.musicManagerService.add(track)) {
        this.refresh$.next();
      }
      this.snackBar.open('Added to My Music');
    });

    this.eventBus.showInLib$
      .subscribe(track => {
        this.navigation.openLibrary();
        setTimeout(() => {
          const trackRef: HTMLElement = this.elementRef.nativeElement.querySelector(`#${track.id}`);
          if (trackRef) {
            trackRef.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
            trackRef.classList.add('active');
            setTimeout(() => trackRef.classList.remove('active'), 3000);
          } else {
            this.snackBar.open(`Track not found ${track.title}`);
          }
        }, 500);
      })

    const filter$ = fromEvent<any>(this.filterInput.nativeElement, 'input')
      .pipe(
        debounceTime(200),
        map(e => e.target.value as string),
        distinctUntilChanged(),
        startWith(null)
      );

    const fetch$ = merge(filter$, this.sort.sortChange, this.refresh$)
      .pipe(
        switchMap(() => {
          const sort = { active: this.sort.active, direction: this.sort.direction };
          return this.musicManagerService.getTracks(this.filter, sort);
        })
      );

    this.navigation.navigate$
      .pipe(
        first(e => e == View.library),
        concatMap(() => fetch$)
      ).subscribe(e => {
        this.filteredTracks = e;
        this.isEmpty = !e || !e.length;
      });
  }

  isPlaying(track: Track) {
    return track == this.player.currentTrack;
  }

  play(track?: Track) {
    this.player.playlist = track ? [track] : this.filteredTracks;
    this.player.play(track || this.player.playlist[0]);
  }

  queue(track?: Track) {
    const queue = track ? [track] : this.filteredTracks;
    this.player.queue(queue);
    this.snackBar.open('Added to Now Playing queue');
  }

  remove(track: Track) {
    const beforeRemove = this.filteredTracks;
    this.filteredTracks = beforeRemove.filter(e => e !== track);
    this.snackBar.open('Removed from My Music', 'Undo')
      .afterDismissed()
      .subscribe(dismiss => {
        if (dismiss.dismissedByAction) {
          // undo remove
          setTimeout(() => {
            this.filteredTracks = beforeRemove.concat();
          })
        } else {
          // do remove
          this.musicManagerService.remove(track);
        }
      });
  }
}