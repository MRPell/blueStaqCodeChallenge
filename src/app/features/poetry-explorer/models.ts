export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: number;
}

export interface AuthorResponse {
  authors: string[];
}

export interface TitleResponse {
  titles: string[];
}

export interface SearchRequest {
  poemSearches: PoemSearchCriteria[];
  outputFields?: poemField[];
  random?: boolean;
  count?: number;
  format?: 'json' | 'text';
}

export interface PoemSearchCriteria {
  input: poemField;
  searchTerm?: string;
  exact: boolean;
}

export interface SearchResponse {
  poems: Poem[];
}

export enum poemField {
  author = 'author',
  title = 'title',
  lines = 'lines',
  linecount = 'linecount'
}

export class SearchRequestBuilder {
  private poemSearchCriteria: PoemSearchCriteria[];
  private outputFields: poemField[] = [];
  private random: boolean = false;
  private count?: number;
  private format: 'json' | 'text' = 'json';

  constructor(poemSearchCriteria: PoemSearchCriteria[]) {
    this.poemSearchCriteria = poemSearchCriteria;
  }

  withOutputFields(fields: poemField[]): SearchRequestBuilder {
    this.outputFields = fields;
    return this;
  }

  addSearchCriteria(criteria: PoemSearchCriteria) {
    this.poemSearchCriteria.push(criteria);
  }
  addInput(input: poemField) {
    this.poemSearchCriteria.push(createSearchCriteria(input));
  }
  addSearch(input: poemField, searchTerm: string) {
    this.poemSearchCriteria.push(createSearchCriteria(input, searchTerm));
  }

  build(): SearchRequest {
    return {
      poemSearches: this.poemSearchCriteria,
      outputFields: this.outputFields,
      random: this.random,
      count: this.count,
      format: this.format,
    };
  }
}

export function createSearchCriteria(input: poemField, searchTerm?: string, exactMatch: boolean = false): PoemSearchCriteria {
  return {
    input: input,
    searchTerm: searchTerm,
    exact: exactMatch
  };
}
