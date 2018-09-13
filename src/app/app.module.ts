import { NgModule } from '@angular/core';
import { MatTabsModule, MatProgressSpinnerModule, MatIconModule } from '@angular/material';

import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { NowPlayingModule } from './now-playing/now-playing.module';
import { MusicExplorerModule } from './music-explorer/music-explorer.module';
import { NoisePlayerModule } from './noise-player/noise-player.module';
import { MusicManagerModule } from './music-manager/music-manager.module';

@NgModule({
  imports: [
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,

    CoreModule,
    NowPlayingModule,
    MusicManagerModule,
    MusicExplorerModule,
    NoisePlayerModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
