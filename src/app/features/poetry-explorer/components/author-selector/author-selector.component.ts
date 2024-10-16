import { Poem } from './../../models';
import { LogService } from './../../../../shared/log.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PoetryService } from '../../poetry.service';

/**
 * @title Author Selector
 * Component for selecting authors from a list.
 */
@Component({
  selector: 'author-selector',
  templateUrl: './author-selector.component.html',
  styleUrls: ['./author-selector.component.scss'],
})
export class AuthorSelectorComponent implements OnInit {
  @Input() formControl = new FormControl('');
  authorOptions: string[] = [];
  filteredAuthorOptions$: Observable<string[]> = new Observable<string[]>();

  constructor(private poetryService: PoetryService, private logger: LogService) { }



  ngOnInit() {
    this.loadAuthors();
    this.initializeFilters();
    this.setupAuthorSelection();
  }

  /**
   * Loads authors from the PoetryService and initializes options.
   */
  private loadAuthors(): void {
    this.poetryService.getAuthors().subscribe({
      next: ({ authors }) => {
        this.authorOptions = authors;
        this.logger.info('Authors loaded successfully');
      },
      error: (err) => this.logger.warning('Failed to load authors', err),
    });
  }


  /**
   * Initializes the filters for author and poem title options based on user input.
   */
  private initializeFilters(): void {
    this.filteredAuthorOptions$ = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, this.authorOptions))
    );
  }

  /**
   * Sets up the author selection and loads titles by the selected author.
   */
  private setupAuthorSelection(): void {
    this.formControl.valueChanges.subscribe(selectedAuthor => {
      this.logger.info(`Selected author: ${selectedAuthor}`);
      if (selectedAuthor && this.authorOptions.includes(selectedAuthor)) {
        this.poetryService.getTitlesByAuthor(selectedAuthor).subscribe({
          next: (response) => {
            this.logger.info('Titles loaded successfully', response);
          },
          error: (err) => this.logger.warning('Failed to load titles', err),
        });
      }
    });
  }

  /**
   * Filters options based on the provided input value.
   * @param value - The input value to filter options by.
   * @param options - The list of options to filter.
   * @returns A list of filtered options.
   */
  private filterOptions(value: string | null, options: string[]): string[] {
    if (!value) return options;
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
