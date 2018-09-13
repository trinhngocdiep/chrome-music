import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatSliderModule, MatButtonModule, MatButtonToggleModule, MatSnackBarModule, MatMenuModule } from '@angular/material';

import { SharedModule } from 'src/app/shared';
import { NowPlayingComponent } from './now-playing.component';
import { PlaylistComponent } from './playlist/playlist.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatMenuModule,

    SharedModule,
  ],
  declarations: [
    NowPlayingComponent,
    PlaylistComponent,
  ],
  exports: [
    NowPlayingComponent
  ]
})
export class NowPlayingModule {
}
