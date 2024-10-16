import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Poem, AuthorResponse, TitleResponse } from './models';
import { ErrorObject } from '../../shared/error-display/error-display.component';

@Injectable({
  providedIn: 'root'
})
export class PoetryService {
  private readonly apiUrl = 'https://poetrydb.org';

  constructor(private http: HttpClient) { }

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
   * Fetches poems based on the provided title and/or author.
   * @param filters - An object containing optional title and author properties.
   * @returns An Observable of an array of Poem objects.
   * @throws Error if neither title nor author is provided.
   */
  getPoemsByFilters(filters: { title?: string; author?: string }): Observable<Poem[]> {
    const { title, author } = filters;
    if (!title && !author) {
      throw new Error('At least one parameter (title or author) must be provided.');
    }

    const endpoint = this.createEndpoint(title, author);
    const params = this.createParams(title, author);

    return this.fetchPoems(endpoint, params);
  }

  private createEndpoint(title?: string, author?: string): string {
    return [title && 'title', author && 'author'].filter(Boolean).join(',');
  }

  private createParams(title?: string, author?: string): Record<string, string> {
    return { ...(title && { title }), ...(author && { author }) };
  }

  private fetchPoems(endpoint: string, params: Record<string, string>): Observable<Poem[]> {
    const queryString = this.buildQueryString(params);

    return this.http.get<Poem[]>(`${this.apiUrl}/${endpoint}/${queryString}`).pipe(
      map(this.validateResponse),
      catchError(this.handleError)
    );
  }

  private buildQueryString(params: Record<string, string>): string {
    return Object.values(params)
      .map(encodeURIComponent)
      .join(';');
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
