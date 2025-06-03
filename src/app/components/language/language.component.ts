import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Exercise } from '../../app.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from "../skeleton/skeleton.component";
import { Evaluacion } from '../math/math.component';

@Component({
  selector: 'app-language',
  imports: [CommonModule, FormsModule, SkeletonComponent],
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
  @Input() course!: '1M' | '2M' | '3M' | '4M';
  @Input() subject!: 'LANG' | 'MATH';

  mainService = inject(MainService);
  mostrarLenguaje = false;

  IAresponse: string[] = [];
  preguntaRespondida: boolean[] = [];
  loading: boolean[] = [];

  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  viewAnswer(index: number) {

    const exercise = this.exercises[index];
    const response = this.userResponses[index];
    const correct = exercise.answer;

    const isCorrect =
      exercise.type === 'multiple_choice'
        ? Number(response) === Number(correct)
        : (response ?? '').toString().trim().toLowerCase() === (correct ?? '').toString().trim().toLowerCase();

    this.respuestasCorrectas[index] = isCorrect;
    this.preguntaRespondida[index] = true;
    if (!isCorrect) {
      this.loading[index] = true;
      this.verify(exercise, index);
    }
  }


  verify(exercise: Exercise, index: number) {
    const rawResponse = this.userResponses[index];
    const userAnswer = exercise.options && typeof rawResponse === 'number'
      ? exercise.options[rawResponse]
      : rawResponse;

    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer }
    }).subscribe({
      next: (res) => {
        // this.IAresponse[index] = res.data.replace(/\n/g, '<br>');

        const evaluacion = this.parseEvaluacionLatex(res.data);
        this.IAresponse[index] = this.renderEvaluacion(evaluacion);


      },
      complete: () => {
        this.loading[index] = false;
      }
    });
  }
  parseEvaluacionLatex(data: string | any): Evaluacion {
    try {
      let evaluacion: Evaluacion;

      if (typeof data === 'string') {
        const match = data.match(/{[\s\S]*}/);
        if (!match) throw new Error("No se encontró JSON en la respuesta");
        evaluacion = JSON.parse(match[0]);
      } else if (typeof data === 'object' && Array.isArray(data.pasos)) {
        evaluacion = data;
      } else if (Array.isArray(data)) {
        evaluacion = {
          correcta: false,
          frase_motivacional: "",
          pasos: data
        };
      } else {
        throw new Error("Formato no reconocido");
      }

      return evaluacion;

    } catch (err) {
      console.error("Error al parsear evaluación:", err);
      return { correcta: false, frase_motivacional: "", pasos: [] };
    }
  }

  renderEvaluacion(evaluacion: Evaluacion): string {
    const header = evaluacion.correcta
      ? `<span>Creo que tu respuesta es correcta, ¡bien hecho!.</span><br><br>`
      : `<span>Creo que tu respuesta es incorrecta, no te preocupes.</span><br><span>Revisemos cómo se resuelve paso a paso.</span><br><br>`;

    const pasosHTML = evaluacion.pasos.map((paso, idx) => {
     
      console.log({ paso })
      const explicacion = paso.explicacion;
      const mejora = paso.en_que_debo_mejorar;
      return `
        <div class="mb-3">
          <strong>Paso ${idx + 1})</strong><br>
          <span>${explicacion}</span><br>
          <br>
          <em class="mt-3">Consejo:</em> ${mejora}
        </div>
      `;
    })
      .join('');

    const frase = evaluacion.frase_motivacional
      ? `<div class="mt-4">${evaluacion.frase_motivacional}</div>`
      : `<div class="mt-4">Vas por buen camino, solo falta afinar algunos detalles.</div>`;

    return header + pasosHTML + frase;
  }

}
