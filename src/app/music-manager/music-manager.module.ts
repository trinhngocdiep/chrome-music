import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatFormFieldModule, MatButtonModule, 
  MatCheckboxModule, MatTableModule, MatSortModule, MatMenuModule, MatInputModule } from '@angular/material';

import { SharedModule } from '../shared';
import { MusicManagerComponent } from './music-manager.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,

    SharedModule,
  ],
  declarations: [MusicManagerComponent],
  exports: [MusicManagerComponent]
})
export class MusicManagerModule { }
