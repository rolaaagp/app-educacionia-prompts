import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import katex from 'katex';
import { Exercise } from '../../app.component';

@Component({
  selector: 'app-language',
  imports: [CommonModule],
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
