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
  excMATH: Exercise[] = [];

  t: string = "";

  loading = false;

  constructor(
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService
  ) { }

  async ngOnInit() {
    // this.excMATH = [
    //   {
    //     "id": 1,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es el valor de x en la ecuación 2x + 5 = 15?",
    //     "options": [
    //       "5",
    //       "7",
    //       "10",
    //       "15"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 2,
    //     "type": "multiple_choice",
    //     "question": "Si una recta pasa por los puntos (2, 3) y (4, 7), ¿cuál es su pendiente?",
    //     "options": [
    //       "1",
    //       "2",
    //       "3",
    //       "4"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 3,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál de las siguientes funciones es lineal?",
    //     "options": [
    //       "f(x) = x^2",
    //       "f(x) = 3x + 2",
    //       "f(x) = sin(x)",
    //       "f(x) = log(x)"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 4,
    //     "type": "multiple_choice",
    //     "question": "Si un objeto cae desde una altura de 100 metros, ¿cuál es su velocidad al llegar al suelo?",
    //     "options": [
    //       "10 m/s",
    //       "20 m/s",
    //       "30 m/s",
    //       "40 m/s"
    //     ],
    //     "answer": 2
    //   },
    //   {
    //     "id": 5,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es la probabilidad de obtener un número par al lanzar un dado?",
    //     "options": [
    //       "1/2",
    //       "1/3",
    //       "1/4",
    //       "1/6"
    //     ],
    //     "answer": 0
    //   },
    //   {
    //     "id": 6,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es el área de un círculo con radio de 5 cm?",
    //     "options": [
    //       "25π cm²",
    //       "50π cm²",
    //       "75π cm²",
    //       "100π cm²"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 7,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es la ecuación de una recta que pasa por los puntos (2, 3) y (4, 7)?",
    //     "options": [
    //       "y = 2x + 1",
    //       "y = 2x + 3",
    //       "y = 4x - 1",
    //       "y = 4x - 3"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 8,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es la razón de proporcionalidad entre dos magnitudes si la primera se duplica cuando la segunda se triplica?",
    //     "options": [
    //       "1/3",
    //       "1/2",
    //       "2/3",
    //       "3/2"
    //     ],
    //     "answer": 3
    //   },
    //   {
    //     "id": 9,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es el valor de x en la ecuación 3x - 7 = 14?",
    //     "options": [
    //       "7",
    //       "9",
    //       "10",
    //       "21"
    //     ],
    //     "answer": 1
    //   },
    //   {
    //     "id": 10,
    //     "type": "multiple_choice",
    //     "question": "¿Cuál es la probabilidad de obtener una cara al lanzar una moneda?",
    //     "options": [
    //       "1/4",
    //       "1/3",
    //       "1/2",
    //       "2/3"
    //     ],
    //     "answer": 2
    //   }
    // ];
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
        console.log({ rawData });
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
        this.loading = false;
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
