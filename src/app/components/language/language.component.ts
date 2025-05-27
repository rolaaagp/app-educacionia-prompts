import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Exercise } from '../../app.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language',
  imports: [CommonModule, FormsModule],
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

  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

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
}
