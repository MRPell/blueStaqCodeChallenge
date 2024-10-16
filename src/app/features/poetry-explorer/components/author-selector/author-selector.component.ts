import { Poem } from './../../models';
import { LogService } from './../../../../shared/log.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  authorControl = new FormControl('');
  poemTitleControl = new FormControl('');
  authorOptions: string[] = [];
  filteredAuthorOptions$: Observable<string[]> = new Observable<string[]>();
  filteredPoemTitleOptions$: Observable<Map<string, string[]>> = new Observable<Map<string, string[]>>();
  poemTitleGroups: Map<string, string[]> = new Map();

  constructor(private poetryService: PoetryService, private logger: LogService) { }

  @Output() poemsRetrieved = new EventEmitter<Poem[]>();


  ngOnInit() {
    this.loadAuthors();
    this.loadTitles();
    this.initializeFilters();
    this.setupAuthorSelection();
  }

  isInputValid() {
    return true;
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
   * Loads titles from the PoetryService and initializes title groups.
   */
  private loadTitles(): void {
    this.poetryService.getTitles().subscribe({
      next: ({ titles }) => {
        this.logger.info('Titles loaded successfully', titles);
        this.categorizeTitlesByInitialLetter(titles);
      },
      error: (err) => this.logger.warning('Failed to load titles', err),
    });
  }


  /**
   * Groups an array of title strings by their first alphabetical letter.
   * Titles that do not start with a letter are grouped under 'OTHER'.
   * The resulting groups are stored in the `poemTitleGroups` map, sorted by key.
   *
   * @param titles - An array of title strings to be grouped.
   * @returns void
   */
  private categorizeTitlesByInitialLetter(titles: string[]): void {
    const isAlphabeticCharacter = (char: string) => /[a-zA-Z]/.test(char);
    const extractInitialLetter = (title: string) => title.split('').find(isAlphabeticCharacter)?.toUpperCase() || 'OTHER';
    const titleGroups = new Map<string, string[]>();

    titles.filter(title => title.length > 0).forEach(title => {
      const initialLetter = extractInitialLetter(title);
      const group = titleGroups.get(initialLetter) || [];
      titleGroups.set(initialLetter, [...group, title]);
    });

    this.poemTitleGroups = new Map([...titleGroups.entries()].sort());
  }


  /**
   * Initializes the filters for author and poem title options based on user input.
   */
  private initializeFilters(): void {
    this.filteredAuthorOptions$ = this.authorControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(value, this.authorOptions))
    );
    this.filteredPoemTitleOptions$ = this.poemTitleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterPoemTitles(value))
    );
  }

  /**
   * Filters the poem titles based on the search term.
   * @param searchTerm - The term to filter titles by.
   * @returns A map of filtered poem titles.
   */
  private filterPoemTitles(searchTerm: string | null): Map<string, string[]> {
    if (!searchTerm) return this.poemTitleGroups;

    const filteredMap = new Map<string, string[]>();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    this.poemTitleGroups.forEach((titles, category) => {
      const matchingTitles = titles.filter(title => title.toLowerCase().includes(lowerCaseSearchTerm));
      if (matchingTitles.length > 0) {
        filteredMap.set(category, matchingTitles);
      }
    });

    return filteredMap;
  }

  /**
   * Sets up the author selection and loads titles by the selected author.
   */
  private setupAuthorSelection(): void {
    this.authorControl.valueChanges.subscribe(selectedAuthor => {
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

  SearchPoetryDb() {
    this.poetryService.getPoemsByFilters({
      title: this.poemTitleControl.value ?? undefined,
      author: this.authorControl.value ?? undefined
    }).subscribe((poems) => {
      this.poemsRetrieved.emit(poems);
      this.logger.info('Poems loaded successfully', poems);
    });
  }
}
