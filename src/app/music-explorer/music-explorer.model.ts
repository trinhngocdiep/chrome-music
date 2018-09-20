import { Track } from 'src/engine';

export class SearchQuery {
    term?: string;
    baseTrack?: Track;
    yt?: boolean = true;
    sc?: boolean = true;
    offset?: SearchQueryOffset;
}

export class SearchResult {
    tracks: Track[] = [];
    offset?: SearchQueryOffset;
    end?: boolean;

    static empty(): SearchResult { return { tracks: [], end: true } }
}

export class SearchQueryOffset {
    yt?: string;
    sc?: string;
}
export class YtSearchResult {
    tracks: Track[];
    nextPageToken?: string;
    static empty(): YtSearchResult { return { tracks: [] } }
}

export class ScSearchResult {
    tracks: Track[];
    nextPageUrl?: string;
    static empty(): ScSearchResult { return { tracks: [] } }
}