import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Track } from 'src/engine';
import { SearchQuery, SearchResult, YtSearchResult, ScSearchResult } from './music-explorer.model';

const scApiKey = '458dac111e2456c40805cd838f4548c1'; // KyZEBUaphfHpKKZ9B0H9JsmvDULUPAkj
const ytApiKey = 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4';
const queryLimit = 10;

@Injectable()
export class MusicExplorerService {

  constructor(private httpClient: HttpClient) { }

  search(query: SearchQuery): Observable<SearchResult> {
    return forkJoin(this.searchYt(query), this.searchSc(query))
      .pipe(
        map(results => {
          const ytResult = results[0];
          const scResult = results[1];
          const offset = { yt: ytResult.nextPageToken, sc: scResult.nextPageUrl };
          const end = !(offset.yt || offset.sc);
          return {
            tracks: ytResult.tracks.concat(scResult.tracks),
            offset: offset,
            end: end
          }
        })
      );
  }

  private searchYt(query: SearchQuery): Observable<YtSearchResult> {
    const term = query.term || '';
    const offset = query.offset && query.offset.yt || '';
    const queryString = getQueryString();

    if (!queryString) {
      return of(YtSearchResult.empty());
    }

    return this.httpClient.get<any>(queryString)
      .pipe(
        map(response => {
          return {
            ids: response.items.map(e => {
              return {
                videoId: e.id.videoId || (e.contentDetails && e.contentDetails.videoId),
                playlistId: e.id.playlistId
              };
            }),
            nextPageToken: response.nextPageToken
          }
        }),
        mergeMap(response => {
          const videoIds = response.ids.map(e => e.videoId).filter(e => !!e);
          const videos$ = this.getYtTrackInfo(videoIds);
          const playlistIds = response.ids.map(e => e.playlistId).filter(e => !!e);
          const playlists$ = this.getYtPlaylistInfo(playlistIds);
          return forkJoin(videos$, playlists$)
            .pipe(
              map(data => {
                return {
                  tracks: data[0].concat(data[1]),
                  nextPageToken: response.nextPageToken
                }
              })
            );
        })
      );

    function getQueryString() {
      // no more result
      if (query.offset && !query.offset.yt) {
        return null;
      }
      if (query.baseTrack) {
        if (query.baseTrack.videoId) {
          return `https://www.googleapis.com/youtube/v3/search?key=${ytApiKey}&maxResults=${queryLimit}&part=id&pageToken=${offset}&type=video&relatedToVideoId=${query.baseTrack.videoId}`;
        }
        if (query.baseTrack.playlistId) {
          return `https://www.googleapis.com/youtube/v3/playlistItems?key=${ytApiKey}&part=contentDetails&maxResults=${queryLimit}&pageToken=${offset}&playlistId=${query.baseTrack.playlistId}`;
        }
        return null;
      } else if (!query.yt) {
        return null;
      }
      return `https://www.googleapis.com/youtube/v3/search?key=${ytApiKey}&maxResults=${queryLimit}&pageToken=${offset}&part=id&type=video,playlist&q=${term}`;
    }
  }

  private getYtTrackInfo(videoIds: string[]): Observable<Track[]> {
    if (videoIds.length == 0) {
      return of([]);
    }
    return this.httpClient.get<any>(`https://www.googleapis.com/youtube/v3/videos?key=${ytApiKey}&part=snippet,contentDetails,status&id=${videoIds.join(',')}`)
      .pipe(
        map(e => e.items as any[]),
        map(e => {
          return e.filter(e => e.status.embeddable).map(e => {
            return {
              title: e.snippet.title,
              source: 'yt',
              sourceName: 'YouTube',
              sourceUrl: `https://youtube.com/watch?v=${e.id}`,
              durationInSeconds: isoDurationToSeconds(e.contentDetails.duration),
              artworkUrl: e.snippet.thumbnails.default.url,
              videoId: e.id,
            };
          });
        })
      );
  }

  private getYtPlaylistInfo(playlistIds: string[]): Observable<Track[]> {
    if (playlistIds.length == 0) {
      return of([]);
    }
    return this.httpClient.get<any>(`https://www.googleapis.com/youtube/v3/playlists?key=${ytApiKey}&part=snippet,contentDetails&id=${playlistIds.join(',')}`)
      .pipe(
        map(e => e.items as any[]),
        map(e => {
          return e.map(e => {
            return {
              title: e.snippet.title,
              source: 'yt',
              sourceName: 'YouTube',
              sourceUrl: `https://www.youtube.com/results?search_query=${e.id}`,
              durationInSeconds: 0,
              durationInTrackCount: e.contentDetails.itemCount,
              artworkUrl: e.snippet.thumbnails.default.url,
              playlistId: e.id,
            };
          });
        })
      );
  }

  private searchSc(query: SearchQuery): Observable<ScSearchResult> {
    const term = query.term || '';
    const nextPageUrl = query.offset && query.offset.sc || '';
    const queryString = getQueryString();
    if (!queryString) {
      return of(ScSearchResult.empty());
    }
    return this.httpClient.get<any>(queryString)
      .pipe(
        map(response => {
          const tracks: Track[] = response.collection
            .map(e => e.track || e)
            .filter(e => e.streamable)
            .map(e => {
              const durationInSeconds = e.duration / 1000;
              return {
                title: e.title, //.replace(/[^\x00-\x7F]/g, ''), // remove non-ASCII characters
                source: 'sc',
                sourceName: 'SoundCloud',
                sourceUrl: e.permalink_url,
                durationInSeconds: durationInSeconds,
                artworkUrl: e.artwork_url,
                stream_url: e.uri + '/stream?client_id=' + scApiKey,
                trackId: e.id
              };
            });
          let nextPageUrl = response.next_href;
          if (nextPageUrl && nextPageUrl.indexOf('&client_id=') < 0) {
            nextPageUrl = nextPageUrl + '&client_id=' + scApiKey;
          }
          return { tracks: tracks, nextPageUrl: nextPageUrl };
        })
      );

    function getQueryString() {
      // No more result
      if (query.offset && !query.offset.sc) {
        return null;
      }

      // there is a base track and it's a SC track
      if (query.baseTrack && query.baseTrack.stream_url) {
        return `${query.baseTrack.stream_url.replace('/stream', '/related')}&linked_partitioning=1`;
      }
      // SC is not enabled
      else if (!query.sc) {
        return null;
      }
      return nextPageUrl || `https://api.soundcloud.com/tracks?linked_partitioning=1&client_id=${scApiKey}&limit=${queryLimit}&q=${term}`;
    }
  }
}

function isoDurationToSeconds(value: string): number {
  let reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  let hours = 0, minutes = 0, seconds = 0;
  if (reptms.test(value)) {
    const matches = reptms.exec(value);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}