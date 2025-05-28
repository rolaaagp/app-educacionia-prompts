import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Exercise } from '../../app.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from "../skeleton/skeleton.component";

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
        this.IAresponse[index] = res.data.replace(/\n/g, '<br>');
      },
      complete: () => {
        this.loading[index] = false;
      }
    });
  }


}
