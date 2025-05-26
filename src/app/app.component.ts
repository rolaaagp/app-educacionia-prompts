import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageComponent } from "./components/language/language.component";
import { MathComponent } from "./components/math/math.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, LanguageComponent, MathComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app';
  language = false;
}
