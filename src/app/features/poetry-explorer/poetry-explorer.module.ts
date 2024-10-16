import { MatIcon } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthorSelectorComponent } from './components/author-selector/author-selector.component';
import { PoetryService } from './poetry.service';
import { LogService } from './../../shared/log.service';

/**
 * PoetryExplorerModule is responsible for providing components and services
 * related to poetry exploration.
 */
@NgModule({
  declarations: [AuthorSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatAutocompleteModule
  ],
  providers: [PoetryService, LogService],
  exports: [AuthorSelectorComponent]
})
export class PoetryExplorerModule {
  constructor(private log: LogService) {
    this.log.info('PoetryExplorerModule initialized');
  }
}
