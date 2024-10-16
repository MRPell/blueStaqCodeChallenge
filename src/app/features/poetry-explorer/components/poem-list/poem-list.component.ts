import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Poem } from '../../models';
import { LogService } from './../../../../shared/log.service';

/**
 * Component for displaying a list of poems.
 */
@Component({
  selector: 'app-poem-list',
  templateUrl: './poem-list.component.html',
  styleUrls: ['./poem-list.component.scss']
})
export class PoemListComponent implements OnChanges {

  @Input() poems: Poem[] | null = [];

  constructor(private logger: LogService) { }

  /**
   * Lifecycle hook that is called when any data-bound property of a directive changes.
   * @param changes - The changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['poems'] && this.poems) {
      this.sortPoems();
      this.logger.info('Poems input changed and sorted.');
    }
  }

  /**
   * Sorts the poems array in place.
   */
  private sortPoems(): void {
    this.poems?.sort((a, b) => a.title.localeCompare(b.title));
  }
}
