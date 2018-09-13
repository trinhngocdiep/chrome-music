import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Runtime } from 'src/app/core';

@Component({
  selector: 'cm-noise',
  templateUrl: './noise.component.html',
  styleUrls: ['./noise.component.css']
})
export class NoiseComponent {
  constructor(
    private runtime: Runtime
  ) { }

  @Input() data;
  @Output() select = new EventEmitter();

  selected = false;
  volume = 30;

  private noisePlayer;

  ngOnInit() {
    this.noisePlayer = this.runtime.engine.noisePlayer;
    let player = this.noisePlayer.getPlayer(this.data);
    if (player) {
      this.volume = player.video.volume * 100;
      this.selected = player.enabled;
      this.select.emit();
    }
  }

  toggleSelection() {
    this.selected = !this.selected;
    if (this.selected) {
      this.play();
      this.setVolume(this.volume);
      this.select.emit();
    } else {
      this.stop();
    }
  }

  setVolume(value) {
    this.noisePlayer.setVolume(this.data, value / 100);
  }

  play() {
    this.noisePlayer.play(this.data);
  }

  stop() {
    this.noisePlayer.stop(this.data);
  }

  setPaused(paused) {
    if (!this.selected) {
      return;
    }
    paused ? this.stop() : this.play();
  }

}
