import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatSliderModule } from '@angular/material';

import { SharedModule } from '../shared';
import { NoisePlayerComponent } from './noise-player.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatSliderModule,

    SharedModule,
  ],
  declarations: [NoisePlayerComponent],
  exports: [NoisePlayerComponent]
})
export class NoisePlayerModule {
}
