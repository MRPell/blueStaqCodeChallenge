import { PoetryExplorerModule } from './features/poetry-explorer/poetry-explorer.module';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/theme.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoetryExplorerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    //     Blue 50
    // #E3F2FD
    // 100
    // #BBDEFB
    // 200
    // #90CAF9
    // 300
    // #64B5F6
    // 400
    // #42A5F5
    // 500
    // #2196F3
    // 600
    // #1E88E5
    // 700
    // #1976D2
    // 800
    // #1565C0
    // 900
    // #0D47A1
    // A100
    // #82B1FF
    // A200
    // #448AFF
    // A400
    // #2979FF
    // A700
    // #2962FF
    this.themeService.setTheme({
      'primary-color': '#1E88E5',
      'secondary-color': '#0D47A1',
      'background-color': '#E3F2FD',
      'text-color': '#212121',
      'accent-color': '#448AFF',
      'border-color': '#A9A9A9',
      'hover-color': '#2962FF',

      'link-color': '#1E88E5',
      'button-color': '#32CD32',
      'button-text-color': '#FFFFFF',

      'header-font': 'Verdana, sans-serif',
      'header-font-size': '30px',
      'header-font-weight': 'bold',

      'paragraph-font': 'Arial, Helvetica, sans-serif',
      'paragraph-font-size': '18px',
      'paragraph-font-weight': 'normal',
      'paragraph-text-color': '#4B0082',
    });
  }
}
