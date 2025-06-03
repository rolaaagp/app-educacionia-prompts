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
import { retry } from 'rxjs';


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
    typeQuestions: "dev"
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
    this.excMATH = [
  {
    "id": 1234,
    "type": "multiple_choice",
    "question": "Si una función lineal tiene una pendiente de [math]2[/math] y pasa por el punto ([math]0, 3[/math]), ¿cuál es la ecuación de la función?",
    "options": [
      "[math]y = 2x + 3[/math]",
      "[math]y = 2x - 3[/math]",
      "[math]y = -2x + 3[/math]",
      "[math]y = -2x - 3[/math]"
    ],
    "answer": 0
  },
  {
    "id": 5678,
    "type": "open_ended",
    "question": "Resuelve la ecuación [math]3x - 5 = 14[/math].",
    "options": null,
    "answer": "x = 6"
  },
  {
    "id": 9012,
    "type": "multiple_choice",
    "question": "Si dos magnitudes son directamente proporcionales, ¿cuál es la relación entre ellas?",
    "options": [
      "[math]y = kx[/math]",
      "[math]y = k/x[/math]",
      "[math]y = k + x[/math]",
      "[math]y = k - x[/math]"
    ],
    "answer": 0
  },
  {
    "id": 3456,
    "type": "open_ended",
    "question": "Calcula el área de un triángulo rectángulo cuya base mide [math]6[/math] cm y su altura mide [math]8[/math] cm.",
    "options": null,
    "answer": "24 cm²"
  },
  {
    "id": 7890,
    "type": "multiple_choice",
    "question": "Si una moneda se lanza [math]10[/math] veces, ¿cuál es la probabilidad de obtener [math]3[/math] caras?",
    "options": [
      "[math]0.1[/math]",
      "[math]0.3[/math]",
      "[math]0.5[/math]",
      "[math]0.7[/math]"
    ],
    "answer": 1
  },
  {
    "id": 2345,
    "type": "open_ended",
    "question": "Resuelve la siguiente ecuación: [math]2x^2 - 3x + 1 = 0[/math].",
    "options": null,
    "answer": "x = 1 o x = 1/2"
  },
  {
    "id": 6789,
    "type": "multiple_choice",
    "question": "Si un rectángulo tiene un perímetro de [math]20[/math] cm y un área de [math]24[/math] cm², ¿cuáles son sus dimensiones?",
    "options": [
      "[math]4[/math] cm y [math]6[/math] cm",
      "[math]5[/math] cm y [math]5[/math] cm",
      "[math]6[/math] cm y [math]4[/math] cm",
      "[math]8[/math] cm y [math]3[/math] cm"
    ],
    "answer": 2
  },
  {
    "id": 1357,
    "type": "open_ended",
    "question": "Calcula el valor de [math]x[/math] en la siguiente proporción: [math]2x:6 = 3:9[/math].",
    "options": null,
    "answer": "x = 3"
  },
  {
    "id": 2468,
    "type": "multiple_choice",
    "question": "Si una función cuadrática tiene vértice en el punto ([math]2, -1[/math]), ¿cuál es su ecuación?",
    "options": [
      "[math]y = x^2 - 2x - 1[/math]",
      "[math]y = x^2 + 2x - 1[/math]",
      "[math]y = -x^2 + 2x - 1[/math]",
      "[math]y = -x^2 - 2x - 1[/math]"
    ],
    "answer": 2
  },
  {
    "id": 3690,
    "type": "open_ended",
    "question": "Resuelve la siguiente ecuación: [math]4x - 2 = 10[/math].",
    "options": null,
    "answer": "x = 3"
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
    const form = { ...this.formData, contents: this.formData.contents.toLowerCase() }
    this.mainService.generateExercises(form).pipe(retry(5)).subscribe({
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
