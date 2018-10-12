import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { NoisePlayer, Noise, NoiseType } from 'src/engine';
import { Navigation, View, Runtime } from 'src/app/core';

@Component({
  selector: 'cm-noise-player',
  templateUrl: './noise-player.component.html',
  styleUrls: ['./noise-player.component.css']
})
export class NoisePlayerComponent {
  constructor(
    private runtime: Runtime,
    private navigation: Navigation
  ) { }

  initiated: boolean;
  noises: UiNoise[];
  noisePlayer: NoisePlayer;

  ngOnInit() {
    this.navigation.navigate$.pipe(first(e => e == View.noises)).subscribe(() => {
      this.noisePlayer = this.runtime.engine.noisePlayer;
      this.noises = [
        this.createNoise(NoiseType.seaside, 'Sea side', 'assets/images/sea-waves.svg'),
        this.createNoise(NoiseType.forest, 'Forest', 'assets/images/forest.svg'),
        this.createNoise(NoiseType.rain, 'Rain', 'assets/images/rain.svg'),
        this.createNoise(NoiseType.thunder, 'Thunder storm', 'assets/images/thunder.svg'),
        this.createNoise(NoiseType.fire, 'Fire', 'assets/images/fire.svg'),
        this.createNoise(NoiseType.summer, 'Summer night', 'assets/images/night.svg'),
        this.createNoise(NoiseType.wind, 'Wind', 'assets/images/wind.svg'),
        this.createNoise(NoiseType.leaves, 'Leaves', 'assets/images/leaves.svg')
      ];
      this.initiated = true;
    });
  }

  private createNoise(type: NoiseType, title: string, icon: string) {
    const noise = this.noisePlayer.getNoise(type);
    return new UiNoise(noise, title, icon);
  }

}

export class UiNoise {
  constructor(
    public noise: Noise,
    public title: string,
    public icon: string
  ) { }

  get playing() { return this.noise.playing }
  get volume() { return this.noise.volume * 100 }
  set volume(value) { this.noise.volume = value / 100 }

}
