import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Poem } from '../../models';
import { PoetryService } from '../../poetry.service';
import { LogService } from '../../../../shared/log.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-poem-search-form',
  templateUrl: './poem-search-form.component.html',
  styleUrls: ['./poem-search-form.component.scss']
})
export class PoemSearchFormComponent implements OnInit {
  authorOptions: string[] = [];
  poemTitleGroups = new Map<string, string[]>();
  filteredAuthorOptions$: Observable<string[]> = new Observable();
  filteredPoemTitleOptions$: Observable<Map<string, string[]>> = new Observable();

  constructor(private poetryService: PoetryService, private logger: LogService) { }

  ngOnInit(): void {
    this.loadAuthors();
    this.loadTitles();
    this.setupAuthorSelection();
  }

  poemForm = new FormGroup({
    author: new FormControl(''),
    title: new FormControl(''),
  });

  get authorControl(): FormControl {
    return this.poemForm.get('author') as FormControl;
  }

  get titleControl(): FormControl {
    return this.poemForm.get('title') as FormControl;
  }

  @Output() poemsRetrieved = new EventEmitter<Poem[]>();

  isInputValid(): boolean {
    return true;
  }

  handleSubmit(): void {
    const { title, author } = this.poemForm.value;
    this.poetryService.getPoemsByFilters({ title: title ?? undefined, author: author ?? undefined })
      .subscribe(poems => {
        this.poemsRetrieved.emit(poems);
        this.logger.info('Poems loaded successfully', poems);
      });
  }

  private loadAuthors(): void {
    this.poetryService.getAuthors().subscribe({
      next: ({ authors }) => {
        this.authorOptions = authors;
        this.logger.info('Authors loaded successfully');
        this.filteredAuthorOptions$ = this.authorControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterOptions(value, this.authorOptions))
        );
      },
      error: err => this.logger.warning('Failed to load authors', err),
    });
  }

  private loadTitles(): void {
    this.poetryService.getTitles().subscribe({
      next: ({ titles }) => {
        this.categorizeTitlesByInitialLetter(titles);
        this.logger.info('Titles loaded successfully', titles);
        this.filteredPoemTitleOptions$ = this.titleControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterPoemTitles(value))
        );
      },
      error: err => this.logger.warning('Failed to load titles', err),
    });
  }

  private categorizeTitlesByInitialLetter(titles: string[]): void {
    const titleGroups = new Map<string, string[]>();
    titles.forEach(title => {
      if (title) {
        const initialLetter = title.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || 'OTHER';
        const group = titleGroups.get(initialLetter) || [];
        titleGroups.set(initialLetter, [...group, title]);
      }
    });
    this.poemTitleGroups = new Map([...titleGroups.entries()].sort());
  }

  private filterPoemTitles(searchTerm: string | null): Map<string, string[]> {
    if (!searchTerm) return this.poemTitleGroups;

    const filteredMap = new Map<string, string[]>();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    this.poemTitleGroups.forEach((titles, category) => {
      const matchingTitles = titles.filter(title => title.toLowerCase().includes(lowerCaseSearchTerm));
      if (matchingTitles.length) {
        filteredMap.set(category, matchingTitles);
      }
    });

    return filteredMap;
  }

  private setupAuthorSelection(): void {
    this.authorControl.valueChanges.subscribe(selectedAuthor => {
      this.logger.info(`Selected author: ${selectedAuthor}`);
      if (selectedAuthor && this.authorOptions.includes(selectedAuthor)) {
        this.poetryService.getTitlesByAuthor(selectedAuthor).subscribe({
          next: response => this.logger.info('Titles loaded successfully', response),
          error: err => this.logger.warning('Failed to load titles', err),
        });
      }
    });
  }

  private filterOptions(value: string | null, options: string[]): string[] {
    if (!value) return options;
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
