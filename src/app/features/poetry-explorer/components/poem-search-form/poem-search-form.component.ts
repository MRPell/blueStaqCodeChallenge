import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Poem } from '../../models';
import { PoetryService } from '../../poetry.service';
import { LogService } from '../../../../shared/log.service';
import { BehaviorSubject, catchError, EMPTY, iif, map, Observable, of, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-poem-search-form',
  templateUrl: './poem-search-form.component.html',
  styleUrls: ['./poem-search-form.component.scss']
})
export class PoemSearchFormComponent implements OnInit {
  private authorOptions: string[] = [];
  private authorTitles: string[] = [];
  private poemTitleGroups = new Map<string, string[]>();
  filteredAuthorOptions$: Observable<string[]> = new Observable();
  private filteredPoemTitleSubject: BehaviorSubject<Map<string, string[]>> = new BehaviorSubject(new Map<string, string[]>());
  filteredPoemTitleOptions$: Observable<Map<string, string[]>> = this.filteredPoemTitleSubject.asObservable();

  constructor(private poetryService: PoetryService, private logger: LogService) { }

  ngOnInit(): void {
    this.loadAuthors();
    this.loadTitles();
    this.initializeAuthorSelection();
    this.filteredPoemTitleOptions$.subscribe(data => console.warn(data));
  }

  poemForm = new FormGroup({
    author: new FormControl('', [this.authorValidator.bind(this)]),
    title: new FormControl('', [this.titleValidator.bind(this)]),
  });

  authorValidator(control: AbstractControl) {
    if (this.authorOptions.length === 0 || !control.value) return null;
    return this.authorOptions?.includes(control.value) ? null : { invalidAuthor: true };
  }

  titleValidator(control: AbstractControl) {
    if (this.authorTitles.length === 0 || !control.value) return null;
    return this.authorTitles.includes(control.value) ? null : { invalidAuthor: true };
  }

  get authorControl(): FormControl {
    return this.poemForm.get('author') as FormControl;
  }

  get titleControl(): FormControl {
    return this.poemForm.get('title') as FormControl;
  }

  @Output() poemsRetrieved = new EventEmitter<Poem[]>();

  isInputValid(): boolean {

    return this.poemForm.valid && (this.authorControl.value || this.titleControl.value);
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
        this.poemTitleGroups = this.categorizeTitlesByInitialLetter(titles);
        this.logger.info('Titles loaded successfully', titles);
        this.filteredPoemTitleOptions$ = this.titleControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterPoemTitles([value]))
        );
      },
      error: err => this.logger.warning('Failed to load titles', err),
    });
  }

  private categorizeTitlesByInitialLetter(titles: string[]): Map<string, string[]> {
    const titleGroups = new Map<string, string[]>();
    titles.forEach(title => {
      if (title) {
        const initialLetter = title.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || 'OTHER';
        const group = titleGroups.get(initialLetter) || [];
        titleGroups.set(initialLetter, [...group, title]);
      }
    });
    return new Map([...titleGroups.entries()].sort());
  }

  private filterPoemTitles(searchTerms: string[] | null): Map<string, string[]> {

    if (!searchTerms || searchTerms.length === 0) {
      return this.poemTitleGroups;
    }

    if (searchTerms.length > 1) {
      const categorized = this.categorizeTitlesByInitialLetter(searchTerms);
      return categorized;
    }

    const flattenedOptions = Array.from(this.poemTitleGroups.values()).flat();
    const filteredOptions = this.filterOptions(searchTerms[0], flattenedOptions);

    return this.categorizeTitlesByInitialLetter(filteredOptions);
  }

  /**
   * Sets up the author selection process by subscribing to changes in the author control.
   * Fetches and filters titles based on the selected author.
   */
  private initializeAuthorSelection(): void {
    this.logger.info('Initializing author selection');

    this.authorControl.valueChanges.subscribe(selectedAuthor => {
      this.logger.info(`Selected author: ${selectedAuthor}`);

      this.fetchAndProcessTitles(selectedAuthor);
    });
  }

  /**
   * Fetches titles for the selected author and processes them.
   * @param author - The author for whom to fetch titles.
   */
  private fetchAndProcessTitles(author: string): void {
    this.logger.info('Fetching titles based on author input');

    this.filteredPoemTitleOptions$ = iif(
      () => (author?.trim() ?? '') !== '',
      this.poetryService.getTitlesByAuthor(author).pipe(
        tap(titles => this.logger.info('Titles fetched successfully', titles)),
        map(titles => {
          this.authorTitles = titles;
          return this.filterPoemTitles(titles);
        }),
        tap(filteredTitles => this.logger.info('Filtered titles', filteredTitles)),
        map(filteredTitles => new Map(filteredTitles)),
        catchError(err => {
          this.logger.warning('Failed to load titles', err);
          return of(new Map<string, string[]>());
        })
      ),
      of(this.poemTitleGroups).pipe(
        tap(titles => this.logger.info('Default titles loaded', titles)),
        map(titleGroups => { return titleGroups; }),

        map(filteredTitles => new Map(filteredTitles))
      )
    );
  }

  private getDefaultTitles(): string[] {
    // Return your default array of titles here
    return ['Default Title 1', 'Default Title 2', 'Default Title 3'];
  }

  private filterOptions(value: string | null, options: string[]): string[] {
    if (!value) return options;
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
