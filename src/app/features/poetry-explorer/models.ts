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
  inputFields: string[];
  searchTerms: string[];
  searchType?: 'abs';
  outputFields?: string[];
  format?: 'json' | 'text';
}

export interface SearchResponse {
  poems: Poem[];
}


