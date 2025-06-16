import { Component, Input, inject, AfterViewChecked, SimpleChanges, OnChanges, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MainService } from '../../../services/main.services';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { retry } from 'rxjs';
import { replaceLatex1 } from '../../shared/latex-utils';
declare const MathJax: any;

@Component({
  selector: 'app-math',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  styleUrl: './math.component.css',
})
export class MathComponent implements AfterViewChecked, OnChanges, OnInit, AfterViewInit {
  @Input() exercises!: any[];
  @Input() course!: '1M' | '2M' | '3M' | '4M';
  @Input() subject!: 'LANG' | 'MATH';
  @Input() mood: any;

  @ViewChildren('canvasElement') canvasElements!: QueryList<ElementRef>;
  private canvasCtx: CanvasRenderingContext2D[] = [];
  private isDrawing: boolean[] = [];

  private cdr = inject(ChangeDetectorRef);
  mainService = inject(MainService);

  preguntaRespondida: boolean[] = [];
  loading: boolean[] = [];
  IAresponse: string[][] = [];
  visibleResponse: string[][] = [];
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
      this.needsTypeset = true;                  // marcar que hay que re-renderizar
      this.cdr.markForCheck();
      this.exercises.forEach((m) => {
        if (Array.isArray(m.options)) {
          m.options = m.options.map((o: string) =>
            o.replace("[math]\\circle[/math]", "[math]\\circ[/math]")
              .replace("[math]\\rhombus[/math]", "[math]\\Diamond[/math]")
              .replace("[math]\\cuadrado[/math]", "[math]\\square[/math]")
          );
        }
      });

      this.loading = Array(this.exercises.length).fill(false);
      this.IAresponse = Array(this.exercises.length).fill([]);
      this.preguntaRespondida = Array(this.exercises.length).fill(false);
      this.userResponses = Array(this.exercises.length).fill('');
      this.respuestasCorrectas = Array(this.exercises.length).fill(null);
    }
    this.updateMathJax();
  }

  trackById(_: number, ex: any) {
    return ex.id ?? _;
  }

  toggleMostrar() {
    this.mostrarMatematicas = !this.mostrarMatematicas;
    if (this.mostrarMatematicas) {
      
      setTimeout(() => {
        this.needsTypeset = true;
        this.cdr.markForCheck();
      }, 0);
    }
  }


  ngAfterViewInit() {
    this.questionElements.forEach((el, i) => {
      const html = replaceLatex1(this.exercises[i].question);
      el.nativeElement.innerHTML = html;
    });
    this.canvasElements.forEach((canvasRef, i) => {
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx) this.canvasCtx[i] = ctx;
    });
    this.updateMathJax();
  }

  ngAfterViewChecked(): void {
    if (this.needsTypeset && this.questionElements.length && this.exercises.length) {
      this.questionElements.forEach((el, i) => {
        const html = replaceLatex1(this.exercises[i].question);
        el.nativeElement.innerHTML = html;
      });

      let index = 0;
      this.exercises.forEach((e) => {
        if (e.options) {
          e.options.forEach((opt: string) => {
            const el = this.optionElements.get(index);
            if (el) el.nativeElement.innerHTML = replaceLatex1(opt);
            index++;
          });
        }
      });

      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch((err: any) => console.error('MathJax render error', err));
      }
      this.needsTypeset = false;
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
      subject: "MATH",
      mood: this.mood,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).pipe(retry(3)).subscribe({
      next: (res) => {
        const render = this.renderEvaluacion(res.data);
        this.IAresponse[index] = render;
        this.visibleResponse[index] = [];

        this.cdr.detectChanges();

        this.revealResponse(index);

        this.needsTypeset = true;
        this.loading[index] = false;
      },
      complete: () => {
        this.loading[index] = false;
      }
    });
  }

  revealResponse(index: number, step = 0) {
    if (!this.IAresponse[index] || step >= this.IAresponse[index].length) return;

    if (!this.visibleResponse[index]) this.visibleResponse[index] = [];

    const block = this.IAresponse[index][step];
    this.visibleResponse[index].push(block);

    this.cdr.markForCheck();
    this.updateMathJax();

    setTimeout(() => this.revealResponse(index, step + 1), 400);
  }



  renderEvaluacion(evaluacion: string): string[] {
    const replaced = replaceLatex1(evaluacion);
    return replaced.split(/<br\s*\/?>|\n+/).map(t => t.trim()).filter(Boolean);
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


  updateMathJax() {
    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise().catch((err: any) => console.error('MathJax render error', err));
    }
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
