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
  excMATH: Exercise[] = [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "¿Cuál es la ecuación de una función lineal que pasa por los puntos (2, 3) y (4, 7)?",
      "options": [
        "[[y = 2x + 1]]",
        "[[y = 2x - 1]]",
        "[[y = 4x - 5]]",
        "[[y = 4x + 3]]"
      ],
      "answer": 2
    },
    {
      "id": 2,
      "type": "multiple_choice",
      "question": "Si una magnitud A es directamente proporcional a una magnitud B, y A = 6 cuando B = 3, ¿cuál es el valor de A cuando B = 9?",
      "options": ["[[A = 18]]", "[[A = 12]]", "[[A = 9]]", "[[A = 6]]"],
      "answer": 0
    },
    {
      "id": 3,
      "type": "multiple_choice",
      "question": "Un recipiente en forma de cilindro tiene un radio de [[5 text{cm}]] y una altura de [[10 text{cm}]]. ¿Cuál es su volumen?",
      "options": [
        "[[125 pi text{cm}^3]]",
        "[[250 pi text{cm}^3]]",
        "[[500 pi text{cm}^3]]",
        "[[1000 pi text{cm}^3]]"
      ],
      "answer": 1
    },
    {
      "id": 4,
      "type": "multiple_choice",
      "question": "Si una función lineal pasa por los puntos (2, 3) y (4, 7), ¿cuál es su ecuación?",
      "options": [
        "[[y = 2x + 1]]",
        "[[y = 2x - 1]]",
        "[[y = 4x - 5]]",
        "[[y = 4x + 3]]"
      ],
      "answer": 2
    },
    {
      "id": 5,
      "type": "multiple_choice",
      "question": "En una urna hay 5 bolas blancas y 3 bolas negras. Si se extrae una bola al azar, ¿cuál es la probabilidad de que sea blanca?",
      "options": [
        "[[frac{3}{8}]]",
        "[[frac{5}{8}]]",
        "[[frac{3}{5}]]",
        "[[frac{5}{3}]]"
      ],
      "answer": 1
    },
    {
      "id": 6,
      "type": "multiple_choice",
      "question": "¿Cuál es la solución de la ecuación de segundo grado [[x^2 - 5x + 6 = 0]]?",
      "options": [
        "[[x = 1, x = 4]]",
        "[[x = 2, x = 3]]",
        "[[x = -2, x = -3]]",
        "[[x = 1, x = -4]]"
      ],
      "answer": 1
    },
    {
      "id": 7,
      "type": "multiple_choice",
      "question": "Si una magnitud A es inversamente proporcional a una magnitud B, y A = 12 cuando B = 3, ¿cuál es el valor de A cuando B = 6?",
      "options": ["[[A = 6]]", "[[A = 12]]", "[[A = 24]]", "[[A = 36]]"],
      "answer": 0
    },
    {
      "id": 8,
      "type": "multiple_choice",
      "question": "Un triángulo rectángulo tiene un cateto de [[6 text{cm}]] y la hipotenusa mide [[10 text{cm}]]. ¿Cuál es la longitud del otro cateto?",
      "options": [
        "[[4 text{cm}]]",
        "[[8 text{cm}]]",
        "[[12 text{cm}]]",
        "[[16 text{cm}]]"
      ],
      "answer": 0
    },
    {
      "id": 9,
      "type": "multiple_choice",
      "question": "Si una función cuadrática pasa por los puntos (0, 2), (2, 6) y (4, 2), ¿cuál es su ecuación?",
      "options": [
        "[[y = x^2 - 2x + 2]]",
        "[[y = x^2 + 2x - 2]]",
        "[[y = -x^2 + 2x + 2]]",
        "[[y = -x^2 - 2x + 2]]"
      ],
      "answer": 2
    },
    {
      "id": 10,
      "type": "multiple_choice",
      "question": "En un dado de 6 caras, ¿cuál es la probabilidad de obtener un número mayor que 4?",
      "options": [
        "[[frac{1}{6}]]",
        "[[frac{2}{6}]]",
        "[[frac{3}{6}]]",
        "[[frac{4}{6}]]"
      ],
      "answer": 2
    }
  ]


  t: string = "";

  loading = false;

  constructor(
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService
  ) { }

  async ngOnInit() {
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
        const rawData = res.data;
        const isArray = Array.isArray(rawData);

        if (!isArray && retryCount < 3) {
          const text = rawData?.toString().toLowerCase() || '';
          if (text.startsWith("sorry") || text.startsWith("lo siento")) {
            console.warn("Respuesta del agente indica fallo, reintentando...");
            this.solicitar(retryCount + 1);
            return;
          }
        }

        const parsed = isArray ? rawData : this.extractExercisesFromText(rawData?.toString() || '');
        const limited = parsed.slice(0, this.formData.quantity_exercise);

        if (!isArray) {
          for (const x of limited) {
            x.options = x.options ? x.options.map((opt: string) => opt.replace(/text/g, '')) : null;
            x.question = x.question.replace(/text/g, '');
          }
        }

        if (this.formData.subject === "LANG") {
          this.excLANG = limited;
        } else {
          this.excMATH = limited;
        }
      },
      error: (err) => {
        console.error("Error al solicitar ejercicios:", err);
      },
      complete: () => {
        this.loading = false;
      }
    });
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
