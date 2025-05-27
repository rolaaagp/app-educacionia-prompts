import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import katex from 'katex';
import { Exercise } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-math',
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  templateUrl: './math.component.html',
  styleUrl: './math.component.css'
})
export class MathComponent {
  @Input() exercises!: Exercise[];

  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];
  mostrarMatematicas = false;

  enviarRespuesta(index: number) {
    const ejercicio = this.exercises[index];
    const respuesta = this.userResponses[index];
    const correcta = ejercicio.answer;

    const esCorrecta =
      ejercicio.type === 'multiple_choice'
        ? Number(respuesta) === Number(correcta)
        : (respuesta ?? '').toString().trim().toLowerCase() === (correcta ?? '').toString().trim().toLowerCase();

    this.respuestasCorrectas[index] = esCorrecta;

    console.log('Respuesta enviada:', { respuesta, correcta, esCorrecta });
  }

  formatLatex(input: string): string {
    return input.replace(/\[\[(.+?)\]\]/g, (_match, expr) => {
      return katex.renderToString(expr, {
        throwOnError: false,
        displayMode: false,
      });
    });
  }

  isPureLatex(value: string): boolean {
    return /^\\\(.+\\\)$/.test(value.trim());
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
