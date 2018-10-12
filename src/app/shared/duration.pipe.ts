import { Pipe } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe {
  transform(value: any) {
    return secondsToHHMMSS(value);
  }
}

export function secondsToHHMMSS(timeInSeconds) {
  let total = parseInt(timeInSeconds, 10);
  if (!total || total <= 0) {
    return '--';
  }
  let hours: any = Math.floor(total / 3600);
  let minutes: any = Math.floor((total - (hours * 3600)) / 60);
  let seconds: any = Math.floor(total - (hours * 3600) - (minutes * 60));

  if (hours == 0) {
    hours = '';
  } else {
    hours = hours + ':';
  }

  if (minutes < 10) {
    minutes = '0' + minutes + ':';
  } else {
    minutes = minutes + ':';
  }

  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hours + minutes + seconds;
}