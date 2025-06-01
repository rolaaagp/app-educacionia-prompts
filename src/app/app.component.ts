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
    this.excMATH = [
      {
        "id": 1234,
        "type": "multiple_choice",
        "question": "¿Cuál de las siguientes figuras geométricas tiene 4 lados iguales y 4 ángulos rectos?",
        "options": [
          "[math]\\square[/math]",
          "[math]\\triangle[/math]",
          "[math]\\circle[/math]",
          "[math]\\rhombus[/math]"
        ],
        "answer": 0
      },
      {
        "id": 5678,
        "type": "multiple_choice",
        "question": "Si un punto tiene coordenadas [math](3, 4)[/math], ¿cuál es su distancia al origen de coordenadas?",
        "options": [
          "[math]\\sqrt{25}[/math]",
          "[math]\\sqrt{13}[/math]",
          "[math]\\sqrt{5}[/math]",
          "[math]\\sqrt{10}[/math]"
        ],
        "answer": 1
      },
      {
        "id": 9012,
        "type": "multiple_choice",
        "question": "¿Cuál de las siguientes afirmaciones sobre la recta perpendicular a otra recta es verdadera?",
        "options": [
          "Forman un ángulo de 45 grados",
          "Forman un ángulo de 60 grados",
          "Forman un ángulo de 90 grados",
          "Forman un ángulo de 180 grados"
        ],
        "answer": 2
      },
      {
        "id": 3456,
        "type": "multiple_choice",
        "question": "Si un triángulo tiene dos lados iguales, ¿cómo se llama?",
        "options": [
          "Isósceles",
          "Equilátero",
          "Escaleno",
          "Rectángulo"
        ],
        "answer": 0
      },
      {
        "id": 7890,
        "type": "multiple_choice",
        "question": "¿Cuál de las siguientes figuras geométricas tiene todos sus lados y ángulos iguales?",
        "options": [
          "[math]\\square[/math]",
          "[math]\\triangle[/math]",
          "[math]\\circle[/math]",
          "[math]\\rhombus[/math]"
        ],
        "answer": 1
      },
      {
        "id": 2345,
        "type": "multiple_choice",
        "question": "Si un punto tiene coordenadas [math](2, -3)[/math], ¿en qué cuadrante se encuentra?",
        "options": [
          "Primer cuadrante",
          "Segundo cuadrante",
          "Tercer cuadrante",
          "Cuarto cuadrante"
        ],
        "answer": 3
      },
      {
        "id": 6789,
        "type": "multiple_choice",
        "question": "¿Cuál de las siguientes figuras geométricas tiene 3 lados y 3 ángulos?",
        "options": [
          "[math]\\square[/math]",
          "[math]\\triangle[/math]",
          "[math]\\circle[/math]",
          "[math]\\rhombus[/math]"
        ],
        "answer": 1
      },
      {
        "id": 1357,
        "type": "multiple_choice",
        "question": "Si un punto tiene coordenadas [math](0, 5)[/math], ¿en qué cuadrante se encuentra?",
        "options": [
          "Primer cuadrante",
          "Segundo cuadrante",
          "Tercer cuadrante",
          "Cuarto cuadrante"
        ],
        "answer": 1
      },
      {
        "id": 2468,
        "type": "multiple_choice",
        "question": "¿Cuál de las siguientes figuras geométricas tiene 4 lados iguales y 4 ángulos iguales?",
        "options": [
          "[math]\\square[/math]",
          "[math]\\triangle[/math]",
          "[math]\\circle[/math]",
          "[math]\\rhombus[/math]"
        ],
        "answer": 0
      },
      {
        "id": 3579,
        "type": "multiple_choice",
        "question": "Si un punto tiene coordenadas [math](-3, 0)[/math], ¿en qué cuadrante se encuentra?",
        "options": [
          "Primer cuadrante",
          "Segundo cuadrante",
          "Tercer cuadrante",
          "Cuarto cuadrante"
        ],
        "answer": 2
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
