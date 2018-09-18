import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatFormFieldModule, MatButtonModule, MatIconModule,
  MatCheckboxModule, MatMenuModule, MatInputModule, MAT_CHECKBOX_CLICK_ACTION,
  MatSlideToggleModule, MatTooltipModule, MatAutocompleteModule, MatDividerModule, MatSelectModule,
} from '@angular/material';

import { SharedModule } from '../shared';
import { MusicExplorerComponent } from './music-explorer.component';
import { SearchboxComponent } from './searchbox/searchbox.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSelectModule,

    SharedModule,
  ],
  declarations: [MusicExplorerComponent, SearchboxComponent],
  exports: [MusicExplorerComponent],
  providers: [
    { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop' }
  ]
})
export class MusicExplorerModule { }
