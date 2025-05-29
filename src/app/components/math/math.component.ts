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
    // this.loading = Array(this.exercises.length).fill(false);
    // this.IAresponse = Array(this.exercises.length).fill('');
    // this.preguntaRespondida = Array(this.exercises.length).fill(false);
    // this.userResponses = Array(this.exercises.length).fill('');
    // this.respuestasCorrectas = Array(this.exercises.length).fill(null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercises']) {
      this.needsTypeset = true;
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
      const html = this.replaceLatex(this.wrapMathExpressions(this.exercises[i].question));
      el.nativeElement.innerHTML = html;
    });


    this.canvasElements.forEach((canvasRef, i) => {
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (ctx) {
        this.canvasCtx[i] = ctx;
      }
    });

    this.updateMathJax();
  }

  ngAfterViewChecked(): void {
    if (this.needsTypeset && this.questionElements?.length && this.exercises?.length) {
      this.questionElements.forEach((el, i) => {
        const html = this.replaceLatex(this.wrapMathExpressions(this.exercises[i].question));
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

    this.mainService.verifyExercise({
      course: this.course,
      subject: this.subject,
      exercise: { ...exercise, userAnswer: resolvedAnswer }
    }).subscribe({
      next: (res) => {
        const evaluacion = this.parseEvaluacionLatex(res.data);
        this.IAresponse[index] = this.renderEvaluacion(evaluacion);
        console.log("IAresponse[i]", this.IAresponse[index])
        console.log("this.loading[index]]", this.loading[index])
        this.updateMathJax();
        this.cdr.detectChanges();
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
          frase_motivacional: "",
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
      return { correcta: false, frase_motivacional: "", pasos: [] };
    }
  }


  renderEvaluacion(evaluacion: Evaluacion): string {
    const header = evaluacion.correcta
      ? `<span>Creo que tu respuesta es correcta, ¡bien hecho!.</span><br><br>`
      : `<span>Creo que tu respuesta es incorrecta, no te preocupes.</span><br><span>Revisemos cómo se resuelve paso a paso.</span><br><br>`;

    const pasosHTML = evaluacion.pasos
      .map((paso, idx) => {
        const explicacion = this.replaceLatex(this.wrapMathExpressions(paso.explicacion));
        const formula = this.replaceLatex(this.wrapMathExpressions(paso.visual_matematica));
        const mejora = this.replaceLatex(this.wrapMathExpressions(paso.en_que_debo_mejorar));
        return `
        <div class="mb-3">
          <strong>Paso ${idx + 1})</strong><br>
          <span>${explicacion}</span><br>
          <span>${formula}</span><br>
          <em>Consejo:</em> ${mejora}
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
    input = input.replace(/\[\[\(([^()\[\]]+)\)\]\]/g, '[[$1]]');

    const unitReplacements: [RegExp, string][] = [
      [/\b(\d+(?:\.\d+)?)\s*m\/s\b/g, '$1\\,\\text{m/s}'],
      [/\b(\d+(?:\.\d+)?)\s*km\/h\b/g, '$1\\,\\text{km/h}'],
      [/\b(\d+(?:\.\d+)?)\s*cm\b/g, '$1\\,\\text{cm}'],
      [/\b(\d+(?:\.\d+)?)\s*cm²\b/g, '$1\\,\\text{cm}^2'],
      [/\b(\d+(?:\.\d+)?)\s*cm\/s\b/g, '$1\\,\\text{cm/s}'],
      [/\b(\d+(?:\.\d+)?)\s*ms⁻¹\b/g, '$1\\,\\text{m\\cdot s^{-1}}'],
      [/\b(\d+(?:\.\d+)?)\s*kg\b/g, '$1\\,\\text{kg}'],
      [/\b(\d+(?:\.\d+)?)\s*g\b/g, '$1\\,\\text{g}'],
      [/\b(\d+(?:\.\d+)?)\s*m\b/g, '$1\\,\\text{m}'],
      [/\b(\d+(?:\.\d+)?)\s*mm\b/g, '$1\\,\\text{mm}'],
      [/\b(\d+(?:\.\d+)?)\s*s\b/g, '$1\\,\\text{s}'],
      [/\b(\d+(?:\.\d+)?)\s*%\b/g, '$1\\,\\%'],
      [/\b(\d+(?:\.\d+)?)\s*°\b/g, '$1\\,^{\\circ}']
    ];

    const applyUnits = (expr: string): string => {
      for (const [pattern, replacement] of unitReplacements) {
        expr = expr.replace(pattern, replacement);
      }
      return expr;
    };


    const escapeLatex = (expr: string): string => {
      expr = expr.replace(/×/g, '\\times');
      return expr
        .replace(/(?<!\\)(frac|sqrt|cdot|pm|leq|geq|neq|infty|text|pi|times|sin|cos|tan|log|ln)/g, '\\$1')
        .replace(/([0-9])\s*\(/g, '$1\\cdot(')
        .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
    };

    input = input.replace(/\[\[(.+?)\]\]/g, (_match, expr) => {
      const cleaned = applyUnits(escapeLatex(expr));
      return `\(${cleaned}\)`;
    });

    input = input.replace(/\\\((.+?)\\\)/g, (_match, expr) => {
      const cleaned = applyUnits(escapeLatex(expr));
      return `\\(${cleaned}\\)`;
    });

    input = input.replace(/\$(.+?)\$/g, (_match, expr) => {
      const cleaned = applyUnits(escapeLatex(expr));
      return `\\(${cleaned}\\)`;
    });


    return input;
  }






  wrapMathExpressions(text: string): string {
    if (typeof text !== 'string') return text;


    if (text.includes('$') && /\$[^$]+\$/.test(text)) {
      return text; // ya es LaTeX, no envolver
    }

    // Si el texto completo es una ecuación simple como y = 2x + 3
    // const fullEquation = /^\s*[a-zA-Z]+\s*=\s*[-+*/^()\d\s.a-zA-Z]+$/;
    // if (fullEquation.test(text.trim())) {
    //   return text.includes('[[') ? text : `[[${text.trim()}]]`;
    // }

    const fullEquation = /^[^=]+=[^=]+$/;
    if (fullEquation.test(text.trim())) {
      return text.includes('[[') ? text : `[[${text.trim()}]]`;
    }



    // Si todo el texto es matemático, lo envolvemos completo
    const fullMathPattern = /^[\d\s\+\-\*\/\^=π°%cmkgms\/\.\(\)]+$/i;
    if (fullMathPattern.test(text.trim())) {
      return text.includes('[[') ? text : `[[${text.trim()}]]`;
    }

    // Reglas específicas
    const rules: { name: string; pattern: RegExp }[] = [
      { name: 'operacion_simple', pattern: /\b\d+\s*[\+\-\*\/\^]\s*\d+\b/g },
      { name: 'ecuacion', pattern: /\b[a-zA-Z]+\s*=\s*[^,.?\n]+/g },
      { name: 'termino_con_variable', pattern: /\b\d+(?:\.\d+)?\s*[a-zA-Z]+\b/g },
      { name: 'funcion_matematica', pattern: /\b[a-zA-Z]+\([^)]+\)/g },
      { name: 'unidad_matematica', pattern: /\b\d+(?:\.\d+)?\s*(cm²|cm³|π|°|%|cm|m|km|mm)\b/g },
      { name: 'unidad_fisica', pattern: /\b\d+(?:\.\d+)?\s*(m\/s|km\/h|cm\/s|ms⁻¹|m·s⁻¹|kg|g|s)\b/g },
      { name: 'constante_pi', pattern: /\bπ\b/g },
      { name: 'potencia', pattern: /\b\d+\s*\^\s*\d+\b/g },
      { name: 'fraccion_simple', pattern: /\b\d+\/\d+\b/g },
      { name: 'porcentaje', pattern: /\b\d+(?:\.\d+)?\s*%\b/g },
      { name: 'desigualdad', pattern: /[<>]=?\s*\d+/g },

      // NUEVAS REGLAS
      { name: 'valor_absoluto', pattern: /\|[^|]+\|/g }, // |x + 2|
      { name: 'raiz_cuadrada_simbolica', pattern: /√\d+/g }, // √16
      { name: 'logaritmo_base', pattern: /\blog_\d+\([^)]+\)/g }, // log_2(8)
      { name: 'producto_parentesis', pattern: /\b\d+\s*\(\s*[a-zA-Z\d+\-*\/^\s]+\s*\)/g }, // 2(x + 3)
      { name: 'intervalo_numerico', pattern: /\[\s*\d+\s*,\s*\d+\s*\]/g }, // [1, 5]
      { name: 'intervalo_abierto', pattern: /\(\s*\d+\s*,\s*\d+\s*\)/g }, // (1, 5)
      { name: 'notacion_cientifica', pattern: /\b\d+(?:\.\d+)?\s*×\s*10\^[-+]?\d+\b/g }, // 1.2 × 10^3
      { name: 'potencia_letra', pattern: /\b[a-zA-Z]+\s*\^\s*\d+\b/g }, // x^2
      { name: 'expresion_con_pi', pattern: /\b\d+π\b/g }, // 2π
      { name: 'exponente_decimal', pattern: /\b\d+(?:\.\d+)?\^\d+\b/g }, // 1.5^2
      { name: 'inecuacion_compuesta', pattern: /\b[a-zA-Z\d\s\+\-\*\/]+\s*[<>]=?\s*[a-zA-Z\d\s\+\-\*\/]+\b/g },
      { name: 'sistema_ecuaciones', pattern: /([a-zA-Z]+\s*=\s*[^,\n]+)[\r\n]+([a-zA-Z]+\s*=\s*[^,\n]+)/g },
      { name: 'raiz_general', pattern: /(?:∛|⁴√|√)\s*\(?[a-zA-Z\d\s\+\-\*\/]+\)?/g },
      { name: 'trig_funcion_compuesta', pattern: /\b(sin|cos|tan)\s*\(\s*[a-zA-Z\d\s\+\-\*\/\^π]+\s*\)/g },
      { name: 'funcion_compuesta', pattern: /\b[a-zA-Z]+\s*\(\s*[a-zA-Z]+\s*\(\s*[a-zA-Z\d\s\+\-\*\/]+\s*\)\s*\)/g },
      { name: 'notacion_funcional', pattern: /\b[a-zA-Z]:\s*ℝ\s*→\s*ℝ\b/g },
      { name: 'pertenencia_conjunto', pattern: /\b[a-zA-Z]+\s*∈\s*ℝ|ℕ|ℤ|ℚ\b/g },
      { name: 'sumatoria', pattern: /∑_\{\s*[a-zA-Z]=\d+\s*\}\^\{\s*[a-zA-Z\d]+\s*\}\s*[a-zA-Z\d\+\-\*\/\^]+\b/g },
      { name: 'productoria', pattern: /∏_\{\s*[a-zA-Z]=\d+\s*\}\^\{\s*[a-zA-Z\d]+\s*\}\s*[a-zA-Z\d\+\-\*\/\^]+\b/g },
      { name: 'notacion_conjunto', pattern: /\{\s*[a-zA-Z]+\s*∈\s*ℝ\s*\|\s*[a-zA-Z\d\s<>=]+\s*\}/g },

      // { name: 'fraccion_latex', pattern: /\\frac\{[^{}]+\}\{[^{}]+\}/g },
      // { name: 'ecuacion_con_fraccion', pattern: /\(\\frac\{[^{}]+\}\{[^{}]+\}[^()]*\)/g }

    ];


    let result = text;

    for (const rule of rules) {
      result = result.replace(rule.pattern, (match) => {
        return match.includes('[[') ? match : `[[${match.trim()}]]`;
      });
    }

    return result;
  }








  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
