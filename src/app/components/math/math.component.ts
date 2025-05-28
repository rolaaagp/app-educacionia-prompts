import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import katex from 'katex';
import { Exercise } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from "../skeleton/skeleton.component";

@Component({
  selector: 'app-math',
  imports: [CommonModule, FormsModule, SkeletonComponent],
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
  @Input() course!: '1M' | '2M' | '3M' | '4M';
  @Input() subject!: 'LANG' | 'MATH';
  mainService = inject(MainService);

  preguntaRespondida: boolean[] = [];
  loading: boolean[] = [];
  IAresponse: string[] = [];
  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];
  mostrarMatematicas = false;

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
      this.verify(exercise, index, response);
      return;
    }
  }

  verify(exercise: Exercise, index: number, userAnswer: string | number) {
    const resolvedAnswer = exercise.options && typeof userAnswer === 'number'
      ? exercise.options[userAnswer]
      : userAnswer;

    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).subscribe({
      next: (res) => {
        const clean = res.data.replace(/\n/g, '<br>').replace(/^.*?(Hola\b)/i, '$1');
        this.IAresponse[index] = clean;

      },
      complete: () => {
        this.loading[index] = false;
      }
    });
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
