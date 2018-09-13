import { NgModule } from '@angular/core';

import { DurationPipe } from './duration.pipe';
import { SoundbarComponent } from './soundbar/soundbar.component';

@NgModule({
  imports: [],
  declarations: [
    SoundbarComponent,
    DurationPipe
  ],
  exports: [
    SoundbarComponent,
    DurationPipe
  ],
})
export class SharedModule { 
}
