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
  private filteredPoemTitleSubject = new BehaviorSubject<Map<string, string[]>>(new Map());
  filteredPoemTitleOptions$ = this.filteredPoemTitleSubject.asObservable();

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
    return !control.value || this.authorOptions.includes(control.value) ? null : { invalidAuthor: true };
  }

  titleValidator(control: AbstractControl) {
    return !control.value || this.authorTitles.includes(control.value) ? null : { invalidTitle: true };
  }

  get authorControl() {
    return this.poemForm.get('author') as FormControl;
  }

  get titleControl() {
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
    return titles.reduce((groups, title) => {
      const initialLetter = title.match(/[a-zA-Z]/)?.[0]?.toUpperCase() || 'OTHER';
      groups.set(initialLetter, [...(groups.get(initialLetter) || []), title]);
      return groups;
    }, new Map<string, string[]>());
  }

  private filterPoemTitles(searchTerms: string[] | null): Map<string, string[]> {
    if (!searchTerms || searchTerms.length === 0) return this.poemTitleGroups;
    const filteredOptions = this.filterOptions(searchTerms[0], Array.from(this.poemTitleGroups.values()).flat());
    return this.categorizeTitlesByInitialLetter(filteredOptions);
  }

  private initializeAuthorSelection(): void {
    this.logger.info('Initializing author selection');
    this.authorControl.valueChanges.subscribe(selectedAuthor => {
      this.logger.info(`Selected author: ${selectedAuthor}`);
      this.fetchAndProcessTitles(selectedAuthor);
    });
  }

  private fetchAndProcessTitles(author: string): void {
    this.logger.info('Fetching titles based on author input');
    this.filteredPoemTitleOptions$ = iif(
      () => author.trim() !== '',
      this.poetryService.getTitlesByAuthor(author).pipe(
        tap(titles => this.logger.info('Titles fetched successfully', titles)),
        map(titles => {
          this.authorTitles = titles;
          return this.filterPoemTitles(titles);
        }),
        catchError(err => {
          this.logger.warning('Failed to load titles', err);
          return of(new Map<string, string[]>());
        })
      ),
      of(this.poemTitleGroups).pipe(
        tap(titles => this.logger.info('Default titles loaded', titles))
      )
    );
  }

  private filterOptions(value: string | null, options: string[]): string[] {
    return options.filter(option => option.toLowerCase().includes(value?.toLowerCase() || ''));
  }
}
