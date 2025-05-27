import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket/socket.service';
import { GetUserByEmailResponse, UserService } from '../services/user/user.service';
import { HttpClientModule } from '@angular/common/http';
import { LanguageComponent } from "./components/language/language.component";
import { MathComponent } from "./components/math/math.component";
import { CommonModule } from '@angular/common';
import { IBody, MainService } from '../services/main.services';


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
  imports: [CommonModule, FormsModule, HttpClientModule, LanguageComponent, MathComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  email: string = '';
  isLoggedInWS: boolean = false;
  user!: GetUserByEmailResponse["data"];

  language: boolean = false;

  formData: IBody = {
    course: '2M',
    subject: 'MATH',
    contents: 'funciones, ecuaciones, proporcionalidad, geometría o probabilidades',
    quantity_exercise: 1,
  };

  excLANG!: Exercise[];
  excMATH!: Exercise[];

  loading = false;

  constructor(
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService
  ) { }

  save() {
    this._userService.getByEmail(this.email).subscribe({
      next: (res) => {
        if (res.data) {
          localStorage.setItem("userEDUCACIONIA", JSON.stringify(res.data));
        }
      }
    })
  }
  solicitar(retryCount: number = 0) {
    this.loading = true;
    this.mainService.generateExercises(this.formData).subscribe({
      next: (res) => {
        const text = res.data?.toString() || '';

        const lower = text.toLowerCase();
        if ((lower.startsWith("sorry") || lower.startsWith("lo siento")) && retryCount < 3) {
          console.warn("Respuesta del agente indica fallo, reintentando...");
          this.solicitar(retryCount + 1);
          return;
        }
        const arr = this.extractExercisesFromText(text);
        console.log(arr);

        if (this.formData.subject === "LANG") {
          this.excLANG = arr;
        } else {
          this.excMATH = arr;
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


  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem("userEDUCACIONIA") as string) as GetUserByEmailResponse["data"];

    if (!user && this.email) {
      this.save();
    }
    if (user) {
      this.isLoggedInWS = await this.socketService.startWSConnection();


      this._userService.message.subscribe((data: any) => {
        const message = JSON.parse(data.data);

        if (message.online) {
          this.isLoggedInWS = true;
        }

        if (message.action && this.isLoggedInWS) {
          console.log("message.action", message.action);
        }
      });
    }
  }
}
