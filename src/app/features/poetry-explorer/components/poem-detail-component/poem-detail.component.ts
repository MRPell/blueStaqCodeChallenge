import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Poem } from '../../models';

@Component({
  selector: 'app-poem-detail-component',
  templateUrl: './poem-detail.component.html',
  styleUrls: ['./poem-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoemDetailComponent {
  @Input() poem: Poem = {} as Poem;
  readonly panelOpenState = signal(false);
}
