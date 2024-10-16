import { ErrorObject } from './../../../../shared/error-display/error-display.component';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { Poem } from '../../models';
import { LogService } from './../../../../shared/log.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-poem-page',
  templateUrl: './poem-page.component.html',
  styleUrls: ['./poem-page.component.scss'] // Corrected typo: styleUrl -> styleUrls
})
export class PoemPageComponent {

  private poemsSubject = new BehaviorSubject<Poem[]>([]);

  loading = false;
  error: any;
  poems$ = this.poemsSubject.asObservable();

  constructor(private logger: LogService) { }

  /**
   * Updates the list of poems.
   * @param poems - An array of Poem objects to update the current list.
   */
  onPoemsRetrieved($event: Poem[]): void {
    this.logger.info('Updating poems list', $event);
    this.poemsSubject.next($event);
    this.error = null;
  }

  onLoading($event: boolean): void {
    this.logger.info('Form loading', $event);
    this.loading = $event;
  }

  onError($event: any) {
    if ($event?.originalError?.status === 404) {
      return;
    }
    this.error = $event;
  }
}
