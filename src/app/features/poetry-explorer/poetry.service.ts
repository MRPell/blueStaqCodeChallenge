import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Poem, AuthorResponse, TitleResponse, SearchRequest, poemField, SearchRequestBuilder, createSearchCriteria } from './models';
import { ErrorObject } from '../../shared/error-display/error-display.component';
import { LogService } from '../../shared/log.service';

@Injectable({
  providedIn: 'root'
})
export class PoetryService {
  private readonly apiUrl = 'https://poetrydb.org';

  constructor(private http: HttpClient, private logger: LogService) { }

  /**
   * Retrieves a list of authors.
   * @returns An Observable of AuthorResponse.
   */
  getAuthors(): Observable<AuthorResponse> {
    return this.http.get<AuthorResponse>(`${this.apiUrl}/author`).pipe(
      map(this.validateResponse),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves titles by a specific author.
   * @param author - The author's name.
   * @returns An Observable of an array of titles.
   */
  getTitlesByAuthor(author: string): Observable<string[]> {
    return this.http.get<Poem[]>(`${this.apiUrl}/author/${author}/title`).pipe(
      map(this.validateResponse),
      map((poems: Poem[]) => poems.map(poem => poem.title)),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves a list of titles.
   * @returns An Observable of TitleResponse.
   */
  getTitles(): Observable<TitleResponse> {
    return this.http.get<TitleResponse>(`${this.apiUrl}/title`).pipe(
      map(this.validateResponse),
      catchError(this.handleError)
    );
  }

  /**
   * Searches for poems based on the specified search request.
   *
   * This method constructs a search query from the given search request and fetches
   * the corresponding poems. The search request must contain valid search terms
   * for each specified field.
   *
   * @param searchRequest - An object containing the search parameters, including
   *                        poemSearches, which is an array of search criteria.
   *                        Each search criterion must have a non-empty searchTerm
   *                        or be entirely omitted.
   *
   * @returns An Observable that emits an array of Poem objects matching the search criteria.
   *
   * @throws Error if the search request contains mismatched fields and search terms.
   *               For example, if fields are specified without corresponding search terms.
   */
  searchPoems(searchRequest: SearchRequest): Observable<Poem[]> {
    const isValidSearch = searchRequest.poemSearches.every((r) => r.searchTerm?.length ?? 0 > 0) || searchRequest.poemSearches.every((r) => !r.searchTerm);
    if (!isValidSearch) {
      throw new Error('Comma delimited fields must have corresponding semicolon delimited search terms, eg. /title,author/Winter;Shakespeare');
    }

    const endpoint = this.createEndpoint(searchRequest);
    const search = this.createSearch(searchRequest);
    const outputs = this.createOutputs(searchRequest);

    return this.fetchPoems(endpoint, search, outputs, searchRequest.format);
  }

  private createOutputs(searchRequest: SearchRequest): string | null {
    return searchRequest.outputFields ? [...searchRequest.outputFields].join(',') : null;
  }

  private createEndpoint(searchRequest: SearchRequest): string {
    return searchRequest.poemSearches.map(s => s.input.toString()).join(',');
  }

  private createSearch(searchRequest: SearchRequest): string | null {
    const hasSearchTerms = searchRequest.poemSearches.some(s => s.searchTerm?.length ?? 0 > 0);
    return hasSearchTerms ? searchRequest.poemSearches.map(s => `${s.searchTerm}${s.exact ? ':abs' : ''}`).join(';') : null;
  }

  private fetchPoems(endpoint: string, search: string | null, outputs: string | null, format: string = '.json'): Observable<Poem[]> {

    return this.http.get<Poem[]>(this.buildUrl(endpoint, search, outputs, format)).pipe(
      map(this.validateResponse),
      catchError(this.handleError)
    );
  }

  private buildUrl(endpoint: string, search: string | null, outputs: string | null, format: string): string {
    let url = `${this.apiUrl}/${endpoint}`;
    if (search) {
      url += `/${search}`;
    }
    if (outputs) {
      url += `/${outputs}.${format}`;
    }
    return `${url}`;
  }

  private validateResponse<T extends object>(response: T): T {
    if ('status' in response && (response as any)['status'] !== 200) {
      console.warn('Response status is not 200', response);

      throw new HttpErrorResponse({ status: (response as any)['status'], statusText: (response as any)['reason'] ?? 'Unknown' });
    }
    return response;
  }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error instanceof HttpErrorResponse
      ? error.statusText
      : `An Error occurred`;
    return throwError(() => ({
      message: errorMessage,
      originalError: error,
    } as ErrorObject));
  }
}
