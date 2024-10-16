import { PoemSearchFormComponent } from './components/poem-search-form/poem-search-form.component';
import { PoemListComponent } from './components/poem-list/poem-list.component';
import { PoemDetailComponent } from './components/poem-detail-component/poem-detail.component';
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
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { PoemPageComponent } from './components/poem-page/poem-page.component';

/**
 * PoetryExplorerModule is responsible for providing components and services
 * related to poetry exploration.
 */
@NgModule({
  declarations: [AuthorSelectorComponent, PoemDetailComponent, PoemListComponent, PoemPageComponent, PoemSearchFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatIcon,
    MatListModule,
    MatAutocompleteModule
  ],
  providers: [PoetryService, LogService],
  exports: [AuthorSelectorComponent, PoemDetailComponent, PoemListComponent, PoemPageComponent, PoemSearchFormComponent]
})
export class PoetryExplorerModule {
  constructor(private log: LogService) {
    this.log.info('PoetryExplorerModule initialized');
  }
}
