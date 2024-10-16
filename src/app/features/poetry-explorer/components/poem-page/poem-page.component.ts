import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { Poem } from '../../models';
import { LogService } from './../../../../shared/log.service';

@Component({
  selector: 'app-poem-page',
  templateUrl: './poem-page.component.html',
  styleUrls: ['./poem-page.component.scss'] // Corrected typo: styleUrl -> styleUrls
})
export class PoemPageComponent {
  private poemsSubject = new BehaviorSubject<Poem[]>([]);
  poems$ = this.poemsSubject.asObservable();

  constructor(private logger: LogService) { }

  /**
   * Updates the list of poems.
   * @param poems - An array of Poem objects to update the current list.
   */
  onPoemsRetrieved(poems: Poem[]): void {
    this.logger.info('Updating poems list', poems);
    this.poemsSubject.next(poems);
  }
}
