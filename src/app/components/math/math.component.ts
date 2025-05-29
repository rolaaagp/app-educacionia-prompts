import { Component, Input, inject, AfterViewChecked, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from '../skeleton/skeleton.component';

import { ElementRef, QueryList, ViewChildren, AfterViewInit } from '@angular/core';

declare const MathJax: any;


type Paso = {
  explicacion: string;
  visual_matematica: string;
  en_que_debo_mejorar: string;
};

type Evaluacion = {
  correcta: boolean;
  pasos: Paso[];
};


@Component({
  selector: 'app-math',
  standalone: true,
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
export class MathComponent implements AfterViewChecked, OnChanges {
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

  needsTypeset = false;

  @ViewChildren('questionEl') questionElements!: QueryList<ElementRef>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercises'] || changes['course'] || changes['subject']) {
      this.needsTypeset = true;
    }
  }

  ngAfterViewInit() {
    this.questionElements.forEach((el, i) => {
      const content = this.replaceLatex(this.exercises[i].question);
      el.nativeElement.innerHTML = content;
    });
    this.updateMathJax();
  }

  ngAfterViewChecked(): void {
    if (this.questionElements?.length && this.exercises?.length) {
      this.questionElements.forEach((el, i) => {
        const html = this.replaceLatex(this.exercises[i].question);
        el.nativeElement.innerHTML = html;
      });
      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise();
      }
    }
  }

  private updateMathJax() {
    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise().catch((err: any) => console.error('MathJax render error', err));
    }
  }

  viewAnswer(index: number) {
    const exercise = this.exercises[index];
    const response = this.userResponses[index];
    this.preguntaRespondida[index] = true;
    this.loading[index] = true;

    const resolvedAnswer = exercise.options && typeof response === 'number'
      ? exercise.options[response]
      : response;

    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).subscribe({
      next: (res) => {
        const evaluacion = this.parseEvaluacionLatex(res.data);
        this.IAresponse[index] = this.renderEvaluacion(evaluacion);
        this.updateMathJax();
        this.needsTypeset = true;
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
          pasos: data
        };
      } else {
        throw new Error("Formato no reconocido");
      }

      evaluacion.pasos = evaluacion.pasos.map((paso) => ({
        ...paso,
        visual_matematica: paso.visual_matematica.replace(/\\\\/g, "\\"),
      }));

      return evaluacion;

    } catch (err) {
      console.error("Error al parsear evaluación:", err);
      return { correcta: false, pasos: [] };
    }
  }


  renderEvaluacion(evaluacion: Evaluacion): string {
    return evaluacion.pasos
      .map((paso, idx) => {
        const formula = this.replaceLatex(`[[${paso.visual_matematica}]]`);
        return `
          <div class="mb-3">
            <strong>Paso ${idx + 1})</strong><br>
            <span>${paso.explicacion}</span><br>
            <span>${formula}</span><br>
            <em>En qué debes mejorar:</em> ${paso.en_que_debo_mejorar}
          </div>
        `;
      })
      .join('');
  }

  replaceLatex(input: string): string {
    return input.replace(/\[\[(.+?)\]\]/g, (_match, expr) => {
      const cleaned = expr
        .replace(/(?<!\\)(frac|sqrt|pm|cdot|leq|geq|neq|infty|left|right|sin|cos|tan|log|ln|text)/g, '\\$1')
        .replace(/([0-9])\s*\(/g, '$1\\cdot(');
      return `\\(${cleaned}\\)`;
    });
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
