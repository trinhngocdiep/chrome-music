import { Component, ViewChildren } from '@angular/core';
import { first } from 'rxjs/operators';

import { Navigation, View } from 'src/app/core';
import { NoiseComponent } from './noise.component';

@Component({
  selector: 'cm-noise-player',
  templateUrl: './noise-player.component.html',
  styleUrls: ['./noise-player.component.css']
})
export class NoisePlayerComponent {
  constructor(private navigation: Navigation) { }

  @ViewChildren(NoiseComponent) noiseComponents;

  init: boolean;
  muted: boolean;
  noises = [
    { icon: 'assets/images/sea-waves.svg', title: 'Sea Side', source: 'https://cdn.noisli.com/hls/seaside/seaside.m3u8' },
    { icon: 'assets/images/forest.svg', title: 'Forest', source: 'https://cdn.noisli.com/hls/forest/forest.m3u8' },
    { icon: 'assets/images/rain.svg', title: 'Rain', source: 'https://cdn.noisli.com/hls/rain/rain.m3u8' },
    { icon: 'assets/images/thunder.svg', title: 'Thunder Storm', source: 'https://cdn.noisli.com/hls/thunderstorm/thunderstorm.m3u8' },
    { icon: 'assets/images/fire.svg', title: 'Fire', source: 'https://cdn.noisli.com/hls/fire/fire.m3u8' },
    { icon: 'assets/images/night.svg', title: 'Summer Night', source: 'https://cdn.noisli.com/hls/summernight/summernight.m3u8' },
    { icon: 'assets/images/wind.svg', title: 'Wind', source: 'https://cdn.noisli.com/hls/wind/wind.m3u8' },
    { icon: 'assets/images/leaves.svg', title: 'Leaves', source: 'https://cdn.noisli.com/hls/leaves/leaves.m3u8' },
  ];

  ngOnInit() {
    this.navigation.navigate$.pipe(first(e => e == View.noises)).subscribe(() => this.init = true);
  }

  toggleMuted() {
    this.muted = !this.muted;
    this.noiseComponents.forEach(e => e.setPaused(this.muted));
  }

  noiseSelected() {
    if (this.muted) {
      this.toggleMuted();
    }
  }
}
