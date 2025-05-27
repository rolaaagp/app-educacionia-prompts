import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import katex from 'katex';
import { Exercise } from '../../app.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-language',
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.css'
})
export class LanguageComponent {

  @Input() exercises!: Exercise[];
  mostrarLenguaje = false;

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = 'A'
  }
}
