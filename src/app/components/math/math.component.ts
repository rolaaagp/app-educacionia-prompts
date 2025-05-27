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
  mostrarMatematicas = false;

  enviarRespuesta(index: number) {
    const ejercicio = this.exercises[index];
    const respuesta = this.userResponses[index];

    console.log('Ejercicio enviado:', ejercicio);
    console.log('Respuesta del usuario:', respuesta);

    // Aquí puedes hacer POST a tu API si es necesario
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
    return String.fromCharCode(65 + index); // 65 = 'A'
  }
}
