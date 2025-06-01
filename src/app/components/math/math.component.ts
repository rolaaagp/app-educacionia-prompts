import { Component, Input, inject, AfterViewChecked, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../app.component';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from '../skeleton/skeleton.component';

import { ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';

declare const MathJax: any;


export type Paso = {
  explicacion: string;
  visual_matematica: string;
  en_que_debo_mejorar: string;
};

export type Evaluacion = {
  correcta: boolean;
  frase_motivacional: string;
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
export class MathComponent implements AfterViewChecked, OnChanges, OnInit {
  @Input() exercises!: Exercise[];
  @Input() course!: '1M' | '2M' | '3M' | '4M';
  @Input() subject!: 'LANG' | 'MATH';

  @ViewChildren('canvasElement') canvasElements!: QueryList<ElementRef>;
  private canvasCtx: CanvasRenderingContext2D[] = [];
  private isDrawing: boolean[] = [];

  private cdr = inject(ChangeDetectorRef);

  mainService = inject(MainService);

  preguntaRespondida: boolean[] = [];
  loading: boolean[] = [];
  IAresponse: string[] = [];
  userResponses: (string | number)[] = [];
  respuestasCorrectas: (boolean | null)[] = [];
  mostrarMatematicas = false;

  needsTypeset = false;

  @ViewChildren('questionEl') questionElements!: QueryList<ElementRef>;
  @ViewChildren('optionEl') optionElements!: QueryList<ElementRef>;
  @ViewChildren('aiResponseBlock') aiResponseBlocks!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.needsTypeset = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercises'] && this.exercises) {
      this.exercises.forEach((m) => {
        if (Array.isArray(m.options)) {
          m.options = m.options.map((o) => {
            if (typeof o !== "string") return o;
            return o
              .replace("[math]\\circle[/math]", "[math]\\circ[/math]")
              .replace("[math]\\rhombus[/math]", "[math]\\Diamond[/math]")
              .replace("[math]\\cuadrado[/math]", "[math]\\square[/math]");
          });
        }
      });
    }

    if (this.exercises) {
      this.loading = Array(this.exercises.length).fill(false);
      this.IAresponse = Array(this.exercises.length).fill('');
      this.preguntaRespondida = Array(this.exercises.length).fill(false);
      this.userResponses = Array(this.exercises.length).fill('');
      this.respuestasCorrectas = Array(this.exercises.length).fill(null);
    }
  }

  ngAfterViewInit() {
    this.questionElements.forEach((el, i) => {
      const html = this.replaceLatex(this.exercises[i].question);
      el.nativeElement.innerHTML = html;
    });

    this.canvasElements.forEach((canvasRef, i) => {
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx) {
        this.canvasCtx[i] = ctx;
      }
    });

    this.exercises.forEach((m) => {
      if (Array.isArray(m.options)) {
        m.options = m.options.map((o) => {
          if (typeof o !== "string") return o;

          return o
            .replace("[math]\\circle[/math]", "[math]\\circ[/math]")
            .replace("[math]\\rhombus[/math]", "[math]\\Diamond[/math]")
            .replace("[math]\\cuadrado[/math]", "[math]\\square[/math]");
        });
      }
    });

    this.updateMathJax();
  }

  ngAfterViewChecked(): void {
    if (this.needsTypeset && this.questionElements?.length && this.exercises?.length) {
      this.questionElements.forEach((el, i) => {
        const html = this.replaceLatex(this.exercises[i].question);
        el.nativeElement.innerHTML = html;
      });

      let index = 0;
      this.exercises.forEach((e) => {
        if (e.options) {
          e.options.forEach((opt, j) => {
            const el = this.optionElements.get(index);
            if (el) {
              const processed = this.replaceLatex(opt);
              el.nativeElement.innerHTML = processed;
            }
            index++;
          });
        }
      });

      setTimeout(() => {
        const el = this.aiResponseBlocks.get(index);
        if (el && typeof MathJax !== 'undefined') {
          MathJax.typesetPromise([el.nativeElement]).catch((err: any) =>
            console.error('MathJax AI block render error', err)
          );
        }
      }, 0);

      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch((err: any) => console.error('MathJax render error', err));
      }

      this.needsTypeset = false;
    }
  }

  startDrawing(event: MouseEvent, index: number) {
    this.isDrawing[index] = true;
    const ctx = this.canvasCtx[index];
    const canvas = this.canvasElements.get(index)?.nativeElement;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent, index: number) {
    if (!this.isDrawing[index]) return;
    const ctx = this.canvasCtx[index];
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  }

  stopDrawing(index: number) {
    this.isDrawing[index] = false;
  }

  clearCanvas(index: number) {
    const canvas = this.canvasElements.get(index)?.nativeElement;
    const ctx = this.canvasCtx[index];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  handleImageUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ctx = this.canvasCtx[index];
        ctx.drawImage(img, 0, 0, 300, 200);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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

    const attemptRender = (data: any) => {
      try {
        const evaluacion = this.parseEvaluacionLatex(data);
        const render = this.renderEvaluacion(evaluacion);
        this.IAresponse[index] = render;
        this.updateMathJax();
        this.cdr.detectChanges();
        this.needsTypeset = true;
      } catch (err) {
        console.warn("Fallo en render o parse, reintentando con verifyExercise...");
        this.retryVerify(exercise, resolvedAnswer, index);
      }
    };

    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).subscribe({
      next: (res) => attemptRender(res.data),
      complete: () => {
        this.loading[index] = false;
      }
    });
  }
  private retryVerify(exercise: Exercise, resolvedAnswer: string | number, index: number) {
    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).subscribe({
      next: (res) => {
        try {
          const evaluacion = this.parseEvaluacionLatex(res.data);
          this.IAresponse[index] = this.renderEvaluacion(evaluacion);
          this.updateMathJax();
          this.cdr.detectChanges();
          this.needsTypeset = true;
        } catch (err) {
          console.error("Reintento fallido: datos inválidos para evaluación.");
          this.IAresponse[index] = 'No se pudo generar una evaluación válida.';
        }
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

    const pasosHTML = evaluacion.pasos
      .map((paso, idx) => {
        const explicacion = this.replaceLatex(paso.explicacion);
        const formula = this.replaceLatex(paso.visual_matematica);
        const mejora = this.replaceLatex(paso.en_que_debo_mejorar);
        return `
        <div class="mb-3">
          <strong>Paso ${idx + 1})</strong><br>
          <span>${explicacion}</span><br>
          <span>${formula}</span><br>
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

  replaceLatex(input: string): string {
    if (!input || typeof input !== 'string') return input;
    const LATEX_COMMANDS_REGEX = /(frac|rac|triangle|Diamond|implies|colon|quad|binom|dfrac|tfrac|sqrt|root|sum|prod|int|lim|log|ln|exp|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|min|max|arg|deg|det|dim|mod|gcd|lcm|circ|cdot|cdots|ldots|vdots|ddots|forall|exists|nexists|infty|partial|nabla|pm|mp|leq|geq|neq|approx|equiv|propto|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|mapsto|hookrightarrow|hookleftarrow|uparrow|downarrow|updownarrow|longrightarrow|longleftarrow|Longrightarrow|Longleftarrow|longleftrightarrow|overline|underline|vec|hat|tilde|bar|dot|ddot|text|boxed)/;

    const escapeLatex = (expr: string): string => {
      expr = expr
        .replace(/\\circle/g, '\\circ')
        .replace(/\\rhombus/g, '\\Diamond')
        .replace(/\\cuadrado/g, '\\square');

      if (new RegExp(`\\\\${LATEX_COMMANDS_REGEX.source}`).test(expr)) {
        return expr.trim();
      }

      return expr
        .replace(new RegExp(`(?<!\\\\)${LATEX_COMMANDS_REGEX.source}`, 'g'), '\\$1')
        .trim();
    };


    return input.replace(/\[math\]([\s\S]+?)\[\/math\]/g, (_m, expr) => {
      const cleaned = escapeLatex(expr.trim());
      return `\\(${cleaned}\\)`;
    });
  }


  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
