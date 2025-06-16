import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from "../skeleton/skeleton.component";
import { Exercise } from '../../main/main.component';


type Paso = {
  explicacion: string;
  visual_matematica: string;
  en_que_debo_mejorar: string;
};

type Evaluacion = {
  correcta: boolean;
  frase_motivacional: string;
  pasos: Paso[];
};


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
export class LanguageComponent implements OnChanges {
  @Input() exercises!: Exercise[];
  @Input() course!: '1M' | '2M' | '3M' | '4M';
  @Input() subject!: 'LANG' | 'MATH';
  @Input() mood: any;

  mainService = inject(MainService);
  mostrarLenguaje = false;

  IAresponse: string[] = [];
  preguntaRespondida: boolean[] = [];
  loading: boolean[] = [];

  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercises'] && Array.isArray(this.exercises)) {
      const count = this.exercises.length;
      this.preguntaRespondida = Array(count).fill(false);
      this.loading = Array(count).fill(false);
      this.userResponses = Array(count).fill('');
      this.respuestasCorrectas = Array(count).fill(null);
      this.IAresponse = Array(count).fill('');

      this.userResponses[0] = "Los piececitos tienen frío porque no tienen zapatos. La Gabriela dice eso nomás. Es como que los pies hablan pero no sé por qué. Creo que es porque hace frío no más, no hay más sentido"

      this.exercises = this.exercises.map((e) => ({
        ...e,
        question: e.question.replace(/\n/g, '<br>')
      }));

    }
  }

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
      subject: "LANG",
      mood: this.mood,
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
