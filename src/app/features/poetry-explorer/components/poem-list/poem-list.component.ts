import { Component } from '@angular/core';
import { Poem } from '../../models';
import { P } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-poem-list',
  templateUrl: './poem-list.component.html',
  styleUrls: ['./poem-list.component.scss']
})
export class PoemListComponent {
  poems: Poem[] = [
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      lines: ['It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.'],
      linecount: 3,
    }];
}
