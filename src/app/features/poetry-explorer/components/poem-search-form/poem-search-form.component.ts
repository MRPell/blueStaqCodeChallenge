import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Poem } from '../../models';
import { PoetryService } from '../../poetry.service';
import { LogService } from '../../../../shared/log.service';

@Component({
  selector: 'app-poem-search-form',
  templateUrl: './poem-search-form.component.html',
  styleUrl: './poem-search-form.component.scss'
})
export class PoemSearchFormComponent {
  author: string = '';

  constructor(private poetryService: PoetryService, private logger: LogService) { }

  poemForm = new FormGroup({
    author: new FormControl(''),
    title: new FormControl(''),
  });


  @Output() poemsRetrieved = new EventEmitter<Poem[]>();

  isInputValid() {
    return true;
  }

  handleSubmit() {
    this.poetryService.getPoemsByFilters({
      title: this.poemForm.value.title ?? undefined,
      author: this.poemForm.value.author ?? undefined
    }).subscribe((poems) => {
      this.poemsRetrieved.emit(poems);
      this.logger.info('Poems loaded successfully', poems);
    });
  }

}
