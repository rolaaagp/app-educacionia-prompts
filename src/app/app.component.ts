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
