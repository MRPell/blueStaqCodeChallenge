import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Poem, poemField, SearchRequestBuilder } from '../../models';
import { PoetryService } from '../../poetry.service';
import { LogService } from '../../../../shared/log.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-poem-search-form',
  templateUrl: './poem-search-form.component.html',
  styleUrls: ['./poem-search-form.component.scss']
})
export class PoemSearchFormComponent implements OnInit {
  @Output() loading = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<any>();
  @Output() poemsRetrieved = new EventEmitter<Poem[]>();
  private filteredAuthorOptionsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  filteredAuthorOptions$: Observable<string[]> = this.filteredAuthorOptionsSubject.asObservable();
  private filteredPoemTitleSubject = new BehaviorSubject<Map<string, Set<string>>>(new Map());
  filteredPoemTitleOptions$ = this.filteredPoemTitleSubject.asObservable();
  private authors: string[] = [];
  private filteredAuthors: string[] = [];
  private titles: string[] = [];
  private authorTitles: string[] = [];
  private filteredTitles: string[] = [];
  private poemTitleGroups = new Map<string, Set<string>>();

  authorValidator = (control: AbstractControl) => {
    this.logger?.info('author validator', this.filteredAuthors.length);
    return !control.value || this.filteredAuthors.length > 0 ? null : { invalidAuthor: true };
  };

  titleValidator = (control: AbstractControl) => {
    this.logger?.info('title validator', this.filteredTitles.length);
    return !control.value || this.filteredTitles.length > 0 ? null : { invalidTitle: true };
  };

  poemForm = new FormGroup({
    author: new FormControl('', [this.authorValidator.bind(this)]),
    title: new FormControl('', [this.titleValidator.bind(this)]),
  });

  constructor(private poetryService: PoetryService, private logger: LogService) { }

  ngOnInit(): void {
    this.loadAuthors();
    this.loadTitles();
    this.titleControl.valueChanges.subscribe(this.handleTitleChanges);
    this.authorControl.valueChanges.subscribe(this.handleAuthorChanges);
  }

  handleTitleChanges = (value: any): void => {
    this.logger.info('title changed', value);
    this.filteredTitles = this.filterOptions(value, this.authorTitles.length == 0 ? this.titles : this.authorTitles);
    this.filteredPoemTitleSubject.next(this.categorizeTitlesByInitialLetter(this.filteredTitles));
    this.titleControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  };

  handleAuthorChanges = (author: any): void => {
    this.logger.info('Author changed', author);
    this.filteredAuthors = this.filterOptions(author, this.authors);
    this.filteredAuthorOptionsSubject.next(this.filteredAuthors);
    this.authorControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.debounce(() => this.getUpdatedTitles(author), 1000)();
  };

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private debounce(callback: () => void, delay: number) {
    return () => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.logger.info('Cleared existing timeout.');
      }
      this.debounceTimer = setTimeout(() => {
        this.logger.info('Executing debounced function.');
        callback();
      }, delay);
    };
  }

  getUpdatedTitles = (value: string): void => {

    if (this.authorControl.valid && value) {
      this.logger.info('Valid author', value);
      this.poetryService.getTitlesByAuthor(value)
        .subscribe({
          next: titles => {
            this.authorTitles = titles;
            this.logger.info(`Title for author ${value} loaded successfully`, titles.length);
            this.filteredTitles = this.filterOptions(this.titleControl.value, titles);
            this.logger.info('Filtered titles', this.filteredTitles.length);
            this.filteredPoemTitleSubject.next(this.categorizeTitlesByInitialLetter(this.filteredTitles));
            this.resetTitleIfInvalid();
          },
          error: err => {
            this.authorTitles = [];
            this.logger.warning('Failed to load titles for author ${value}', err);
          }
        });
    } else {
      this.authorTitles = [];
      this.filteredPoemTitleSubject.next(this.poemTitleGroups);
    }

  };

  get authorControl() {
    return this.poemForm.get('author') as FormControl;
  }

  get titleControl() {
    return this.poemForm.get('title') as FormControl;
  }

  isInputValid(): boolean {
    return this.poemForm.valid && (this.authorControl.value || this.titleControl.value);
  }

  handleSubmit(): void {
    const { title, author } = this.poemForm.value;
    this.loading.emit(true);

    const searchBuilder = new SearchRequestBuilder([]);
    if (title) {
      searchBuilder.addSearch(poemField.title, title);
    }
    if (author) {
      searchBuilder.addSearch(poemField.author, author);
    }

    this.poetryService.searchPoems(searchBuilder.build())
      .subscribe({
        next: poems => {
          this.poemsRetrieved.emit(poems);
          this.logger.info('Poems loaded successfully', poems);
        },
        error: err => {
          this.error.emit(err);
          this.loading.emit(false);
          this.logger.warning('Failed to load poems', err);
          return err;
        },
        complete: () => this.loading.emit(false)
      });
  }

  private loadAuthors(): void {
    this.poetryService.getAuthors().subscribe({
      next: ({ authors }) => {
        this.authors = authors;
        this.logger.info('Authors loaded successfully');
        this.filteredAuthorOptionsSubject.next(this.authors);
      },
      error: err => this.logger.warning('Failed to load authors', err),
    });
  }

  private loadTitles(): void {
    this.poetryService.getTitles().subscribe({
      next: ({ titles }) => {
        this.titles = titles;
        this.poemTitleGroups = this.categorizeTitlesByInitialLetter(titles);
        this.filteredPoemTitleSubject.next(this.poemTitleGroups);
        this.logger.info('Titles loaded successfully', titles);
      },
      error: err => this.logger.warning('Failed to load titles', err),
    });
  }

  private categorizeTitlesByInitialLetter(titles: string[]): Map<string, Set<string>> {
    return titles.reduce((groups, title) => {
      const initialLetter = title.match(/[a-zA-Z]/)?.[0]?.toUpperCase() ?? 'OTHER';
      const titlesSet = groups.get(initialLetter) ?? new Set<string>();
      titlesSet.add(title);
      groups.set(initialLetter, titlesSet);
      return groups;
    }, new Map<string, Set<string>>());
  }

  private filterOptions(value: string | null, options: string[]): string[] {
    return options.filter(option => option.toLowerCase().includes(value?.toLowerCase() || ''));
  }

  private resetTitleIfInvalid() {
    this.titleControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    if (this.titleControl.invalid) { this.titleControl.reset(); }
  }
}
