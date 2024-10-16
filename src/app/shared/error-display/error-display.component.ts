import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LogService } from '../log.service';

export interface ErrorObject {
  message: string;
  code?: number;
  details?: string;
  originalError?: any;
}

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  `,
  styles: [`
    .error-message {
      color: red;
      font-weight: bold;
      padding: 10px;
      border: 1px solid red;
      background-color: #ffe6e6;
      border-radius: 5px;
    }
  `]
})
export class ErrorDisplayComponent implements OnChanges {

  @Input() error: ErrorObject | string | null = null;
  errorMessage: string = '';

  constructor(private logger: LogService) { }

  /**
   * Lifecycle hook that is called when any data-bound property of a directive changes.
   * @param changes - The changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['error']) {
      this.logger.warning('Error display imminent!', this.error);

      this.errorMessage = this.extractErrorMessage(this.error);
    }
  }

  /**
   * Extracts a user-friendly error message from an error object.
   * @param error - The error object to extract the message from.
   * @returns A string representing the error message.
   */
  private extractErrorMessage(error: ErrorObject | string | null): string {
    if (!error) return '';

    if (typeof error === 'string') return error;

    if (error.originalError.status === 404) return 'The resource you requested was not found.';

    if (error.message) return error.message;

    return 'An unknown error occurred.';
  }
}
