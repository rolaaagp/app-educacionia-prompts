import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket/socket.service';
import { GetUserByEmailResponse, UserService } from '../services/user/user.service';
import { HttpClientModule } from '@angular/common/http';
import { LanguageComponent } from "./components/language/language.component";
import { MathComponent } from "./components/math/math.component";
import { CommonModule } from '@angular/common';
import { IBody, MainService } from '../services/main.services';
import { SkeletonComponent } from "./components/skeleton/skeleton.component";


export type Exercise = {
  id: number;
  type: "open_ended" | "multiple_choice";
  question: string;
  options: string[] | null;
  answer: string | number;
  userAnswer?: string | number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, LanguageComponent, MathComponent, SkeletonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  email: string = 'rgarcia@nexia.cl';
  isLoggedInWS: boolean = false;
  user!: GetUserByEmailResponse["data"];

  language: boolean = false;

  formData: IBody = {
    user_id: 0,
    course: '2M',
    subject: 'MATH',
    contents: 'funciones, ecuaciones, proporcionalidad, geometría o probabilidades',
    quantity_exercise: 1,
    typeQuestions: "mix"
  };

  excLANG!: Exercise[];
  excMATH!: Exercise[];

  t: string = "";

  loading = false;

  constructor(
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService
  ) { }

  async ngOnInit() {
    // this.excLANG = [
    //   {
    //     "id": 1,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes palabras o expresiones proviene de una lengua originaria y se usa en el español de Chile?",
    //     "options": [
    //       "\\(\\text{Chao}\\)",
    //       "\\(\\text{Cachai}\\)",
    //       "\\(\\text{Bacán}\\)",
    //       "\\(\\text{Pololo}\\)"
    //     ],
    //     "answer": 3
    //   },
    //   {
    //     "id": 2,
    //     "type": "open_ended",
    //     "question": "Investiga y describe una jerga generacional que se use en tu comunidad. Explica su origen, significado y contexto de uso.",
    //     "options": null,
    //     "answer": ""
    //   },
    //   {
    //     "id": 3,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes expresiones provendría más probablemente de un pueblo migrante que ha llegado a Chile?",
    //     "options": [
    //       "\\(\\text{Güena}\\)",
    //       "\\(\\text{Cabro}\\)",
    //       "\\(\\text{Weón}\\)",
    //       "\\(\\text{Onda}\\)"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 4,
    //     "type": "open_ended",
    //     "question": "Analiza el siguiente fragmento y explica cómo se relacionan las palabras \"aliado\", \"mancomunada\" y \"convenio\".",
    //     "options": null,
    //     "answer": ""
    //   },
    //   {
    //     "id": 5,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes afirmaciones sobre el español de Chile es correcta?",
    //     "options": [
    //       "\\(\\text{Es una variante completamente diferente al español estándar}\\)",
    //       "\\(\\text{Tiene un vocabulario básico fundamental común con otras variantes}\\)",
    //       "\\(\\text{Se habla de forma muy distinta a otras regiones de Hispanoamérica}\\)",
    //       "\\(\\text{No comparte la misma morfosintaxis que el español estándar}\\)"
    //     ],
    //     "answer": 2
    //   }
    // ]

    // this.excMATH = [
    //   {
    //     "id": 1,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es la solución de la ecuación $2x + 5 = 13$?",
    //     "options": [
    //       "$x = 4$",
    //       "$x = 3$",
    //       "$x = 2$",
    //       "$x = 1$"
    //     ],
    //     "answer": 0
    //   },
    //   {
    //     "id": 2,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes funciones es lineal?",
    //     "options": [
    //       "$f(x) = 2x^2 + 3$",
    //       "$f(x) = 4x + 1$",
    //       "$f(x) = \sqrt{x} + 2$",
    //       "$f(x) = x^3 - 1$"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 3,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes afirmaciones sobre funciones afines es verdadera?",
    //     "options": [
    //       "Todas las funciones afines son lineales",
    //       "Ninguna función afín es lineal",
    //       "Algunas funciones afines son lineales",
    //       "Las funciones afines no tienen pendiente"
    //     ],
    //     "answer": 2
    //   },
    //   {
    //     "id": 4,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de los siguientes es un ejemplo de pensamiento metacognitivo en matemáticas?",
    //     "options": [
    //       "Resolver una ecuación de segundo grado",
    //       "Graficar una función cuadrática",
    //       "Reflexionar sobre las estrategias utilizadas para resolver un problema",
    //       "Calcular el área de un círculo"
    //     ],
    //     "answer": 2
    //   },
    //   {
    //     "id": 5,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes es una característica de una función lineal?",
    //     "options": [
    //       "Tiene una gráfica parabólica",
    //       "Tiene una gráfica exponencial",
    //       "Tiene una gráfica recta",
    //       "Tiene una gráfica logarítmica"
    //     ],
    //     "answer": 2
    //   }
    // ]

    this.excMATH = [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "¿Cuál es el resultado de la siguiente suma: $2 + 3$?",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "answer": 1
      },
      {
        "id": 2,
        "type": "open_ended",
        "question": "Resuelve la siguiente suma: $5 + 7$",
        "options": null,
        "answer": "12"
      },
      {
        "id": 3,
        "type": "multiple_choice",
        "question": "¿Cuál es el resultado de la siguiente suma: $8 + 2$?",
        "options": [
          "8",
          "9",
          "10",
          "11"
        ],
        "answer": 2
      },
      {
        "id": 4,
        "type": "open_ended",
        "question": "Resuelve la siguiente suma: $3 + 4$",
        "options": null,
        "answer": "7"
      },
      {
        "id": 5,
        "type": "multiple_choice",
        "question": "¿Cuál es el resultado de la siguiente suma: $6 + 1$?",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "answer": 3
      },
      {
        "id": 6,
        "type": "open_ended",
        "question": "Resuelve la siguiente suma: $9 + 2$",
        "options": null,
        "answer": "11"
      },
      {
        "id": 7,
        "type": "multiple_choice",
        "question": "¿Cuál es el resultado de la siguiente suma: $4 + 4$?",
        "options": [
          "6",
          "7",
          "8",
          "9"
        ],
        "answer": 3
      },
      {
        "id": 8,
        "type": "open_ended",
        "question": "Resuelve la siguiente suma: $7 + 3$",
        "options": null,
        "answer": "10"
      },
      {
        "id": 9,
        "type": "multiple_choice",
        "question": "¿Cuál es el resultado de la siguiente suma: $1 + 6$?",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "answer": 2
      },
      {
        "id": 10,
        "type": "open_ended",
        "question": "Resuelve la siguiente suma: $2 + 8$",
        "options": null,
        "answer": "10"
      }
    ]
    this.format(this.excLANG)

    this.socketService.connectadConfirmed$.subscribe((estado) => {
      console.log("WebSocket:", estado); // o usa un toast, alert, etc.
    });

    const user = JSON.parse(localStorage.getItem("userEDUCACIONIA") as string) as GetUserByEmailResponse["data"];
    if (user) {
      this.user = user;
      this.formData.user_id = user.user_id;
      this.isLoggedInWS = await this.socketService.startWSConnection();
    }
  }

  save() {
    this._userService.getByEmail(this.email).subscribe({
      next: async (res) => {
        if (res.data) {
          this.user = res.data;
          this.formData.user_id = res.data.user_id;
          localStorage.setItem("userEDUCACIONIA", JSON.stringify(res.data));
          if (!this.isLoggedInWS) {
            this.isLoggedInWS = await this.socketService.startWSConnection();

            this._userService.message.subscribe((data: any) => {
              console.log("datasocket", data);
              const message = JSON.parse(data.data);
              if (message.online) this.isLoggedInWS = true;
              if (message.action && this.isLoggedInWS) {
                // switch(message.action){
                //   case "resultRequestAgent": {
                //     this.t += message.chunkText
                //   }
                // }
              }
            });
          }
        }
      }
    });
  }

  solicitar(retryCount: number = 0) {
    this.loading = true;

    this.mainService.generateExercises(this.formData).subscribe({
      next: (res) => {
        let rawData = res.data;
        if (rawData?.rawData && typeof rawData.rawData === 'string') {
          try {
            rawData = JSON.parse(rawData.rawData);
          } catch (err) {
            console.error('Error al parsear rawData.rawData como JSON:', err);
            rawData = [];
          }
        }

        const isArray = Array.isArray(rawData);
        console.log({ rawData });
        if (!isArray || !rawData || (isArray && rawData.length <= 0) && retryCount < 3) {
          const text = rawData?.toString().toLowerCase() || '';
          if (text.startsWith("sorry") || text.startsWith("lo siento")) {
            console.warn("Respuesta del agente indica fallo, reintentando...");
            this.solicitar(retryCount + 1);
            return;
          }
        }

        const parsed = isArray ? rawData : this.extractExercisesFromText(rawData?.toString() || '');
        const limited = parsed.slice(0, this.formData?.quantity_exercise);

        if (!isArray) {
          this.format(limited);
        }

        if (this.formData.subject === "LANG") {
          this.excLANG = limited;
        } else {
          this.excMATH = limited;
        }
      },
      error: (err) => {
        console.error("Error al solicitar ejercicios:", err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });

  }

  format(limited: Exercise[]) {
    if (limited && limited.length > 0) {
      for (const x of limited) {
        if (x.options && x.options.some((opt: string) => opt.includes('\\(') || opt.includes('\\text'))) {
          x.options = x.options.map((opt: string) =>
            opt
              .replace(/\\\(/g, '')
              .replace(/\\\)/g, '')
              .replace(/\\text\{(.*?)\}/g, '$1')
              .trim()
          );
        }

        if (x.question.includes('\\(') || x.question.includes('\\text')) {
          x.question = x.question
            .replace(/\\\(/g, '')
            .replace(/\\\)/g, '')
            .replace(/\\text\{(.*?)\}/g, '$1')
            .trim();
        }
      }
    }

  }

  extractExercisesFromText(text: string): Exercise[] {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;

    if (start === -1 || end === -1 || start >= end) {
      throw new Error('No se encontró un array JSON válido en el texto.');
    }

    const arrayString = text.slice(start, end);
    return JSON.parse(arrayString);
  }




}
