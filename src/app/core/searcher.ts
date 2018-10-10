import * as fuzzysort from 'fuzzysort';
import { Sort } from '@angular/material';

import { Track } from 'src/engine';

export class Searcher {

  private index: Fuzzysort.Fuzzysort = fuzzysort.new({ allowTypo: true, threshold: -10000 });
  private tracks: Track[] = [];
  private targets: SearchableTrack[] = [];

  updateIndex(tracks: Track[]) {
    this.tracks = tracks;
    this.targets = tracks.map(e => {
      return { origin: e, title: sanitizeSearchString(e.title), sourceName: e.sourceName };
    });
  }

  search(filter: string, sort: Sort): Track[] {
    return doSort(this.filter(filter), sort);
  }

  private filter(filter: string) {
    filter = filter && filter.trim();
    if (!filter) {
      return this.tracks;
    }
    return this.index.go(filter, this.targets, { keys: ['sourceName', 'title'] }).map(e => e.obj.origin);
  }
}

/**
 * Removes diacritics in Vietnamese, French, Portuguese, etc.
 */
function sanitizeSearchString(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function doSort(tracks: Track[], sort: Sort): Track[] {
  if (!sort || !sort.active || !sort.direction) {
    return tracks;
  }
  const sortField = sort.active;
  const sortAscending = sort.direction != 'desc';
  if (sortField == 'durationInSeconds') {
    return sortAscending ? tracks.sort((a, b) => a.durationInSeconds - b.durationInSeconds)
      : tracks.sort((b, a) => a.durationInSeconds - b.durationInSeconds);
  }
  return sortAscending ? tracks.sort((a, b) => a[sortField].localeCompare(b[sortField]))
    : tracks.sort((b, a) => a[sortField].localeCompare(b[sortField]));
}

class SearchableTrack {
  origin: Track;
  title: string;
}