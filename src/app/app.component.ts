import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket/socket.service';
import { GetUserByEmailResponse, UserService } from '../services/user/user.service';
import { HttpClientModule } from '@angular/common/http';
import { LanguageComponent } from "./components/language/language.component";
import { MathComponent } from "./components/math/math.component";
import { CommonModule } from '@angular/common';
import { IBody, MainService } from '../services/main.services';
import { SkeletonComponent } from "./components/skeleton/skeleton.component";
import { catchError, forkJoin, of, retry } from 'rxjs';


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
  onKnow: boolean = false;
  user!: GetUserByEmailResponse["data"];

  language: boolean = false;

  formData: IBody = {
    user_id: 1,
    course: '2M',
    subject: 'MATH',
    contents: 'funciones, ecuaciones, proporcionalidad, geometría o probabilidades',
    quantity_exercise: 20,
    typeQuestions: "dev",
    mood: "neutro"
  };

  excLANG!: Exercise[];
  excMATH!: Exercise[];

  t: string = "";

  loading = false;


  materialApoyo: any;

  constructor(
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {

    this.excLANG = [
      {
        "id": 7392,
        "type": "open_ended",
        "question": "Lee el siguiente fragmento del poema 'Piececitos' de Gabriela Mistral:\n\n'Piececitos de niño,\nazulosos de frío,\n¡cómo os ven y no os cubren,\nDios mío!'\n\nAnaliza el uso de la personificación en estos versos y explica cómo contribuye a transmitir el mensaje central del poema.",
        "options": null,
        "answer": ""
      }
    ]
    this.excMATH = [
      {
        "id": 9234,
        "type": "open_ended",
        "question": "Una fábrica produce [math]x[/math] unidades de un producto en [math]t[/math] horas. Si la relación entre estas variables se representa mediante la función [math]f(t) = 50t - 20[/math], determina cuántas unidades se producirán en 8 horas.",
        "options": null,
        "answer": "380 unidades"
      },
      {
        "id": 5678,
        "type": "open_ended",
        "question": "En un triángulo rectángulo, la hipotenusa mide 13 cm y uno de los catetos mide 5 cm. Calcula la longitud del otro cateto utilizando el teorema de Pitágoras.",
        "options": null,
        "answer": "12 cm"
      },
      {
        "id": 3456,
        "type": "open_ended",
        "question": "En una urna hay 5 bolas rojas, 3 bolas azules y 2 bolas verdes. Si se extrae una bola al azar, ¿cuál es la probabilidad de que sea roja o verde?",
        "options": null,
        "answer": "0.7 o 7/10"
      },
      {
        "id": 7392,
        "type": "open_ended",
        "question": "Una empresa de telefonía móvil ofrece un plan con un cargo fijo mensual de $5000 más $50 por cada minuto de llamada. Si [math]x[/math] representa los minutos de llamada al mes, expresa la función que modela el costo total mensual [math]C(x)[/math] y determina el costo para un mes con 120 minutos de llamadas.",
        "options": null,
        "answer": "La función es [math]C(x) = 50x + 5000[/math]. El costo para 120 minutos es $11000."
      },
      {
        "id": 4815,
        "type": "open_ended",
        "question": "En un experimento de laboratorio, se lanza una pelota desde una altura de 20 metros. La altura [math]h[/math] de la pelota en metros después de [math]t[/math] segundos está dada por la función [math]h(t) = -5t^2 + 10t + 20[/math]. Calcula en qué momento la pelota tocará el suelo.",
        "options": null,
        "answer": "La pelota tocará el suelo después de 4 segundos."
      }
    ]
    const user = JSON.parse(localStorage.getItem("userEDUCACIONIA") as string) as GetUserByEmailResponse["data"];
    if (user) {
      this.user = user;
      this.formData.user_id = user.user_id;
    }

    this.socketService.setUserMessageSubject(this._userService.message);
    this.socketService.connect("wss://soc-api-educacion.csff.cl");

    this.socketService.connectadConfirmed$.subscribe((estado) => {
      this.isLoggedInWS = estado === 'conectado';
      console.log("WebSocket:", estado);
    });

    this._userService.message.subscribe({
      next: (res: any) => {
        console.log("Socket Message App Component ->", res)
        try {
          const payload = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;


          if (payload.action === "onKnow") this.onKnow = payload.online

          if (payload.action === 'chunkExercises_MATH' && Array.isArray(payload.data)) {
            console.log("Chunk Math ++ ->", payload.data)
            this.excMATH = [...this.excMATH, ...payload.data];
            this.cdr.detectChanges();
          }

          if (payload.action === 'chunkExercises_LANG' && Array.isArray(payload.data)) {
            console.log("Chunk Lang ++ ->", payload.data)
            this.excLANG = [...this.excLANG, ...payload.data];
            this.cdr.detectChanges();
          }

        } catch (error) {
          console.error('Error al procesar mensaje de socket:', error);
        }
      }
    });

    this.isLoggedInWS = await this.socketService.startWSConnection();
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

  solicitarPorChunks() {
    this.loading = true;
    const total = this.formData.quantity_exercise;
    const chunkSize = 1;
    const chunks = Math.ceil(total / chunkSize);
    const contents = this.formData.contents.toLowerCase();

    const requests = Array.from({ length: chunks }, (_, i) => {
      const cantidad = i === chunks - 1 ? total - chunkSize * i : chunkSize;
      const payload = { ...this.formData, contents, quantity_exercise: cantidad };
      return this.mainService.generateExercises(payload).pipe(
        retry(3),
        catchError((err) => {
          console.error('Error en chunk', i, err);
          return of({ data: [] });
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (responses) => {
        const all = responses.flatMap((res) => {
          let rawData = res.data;
          if (rawData?.rawData && typeof rawData.rawData === 'string') {
            try {
              rawData = JSON.parse(rawData.rawData);
            } catch {
              rawData = [];
            }
          }
          return Array.isArray(rawData)
            ? rawData
            : this.extractExercisesFromText(rawData?.toString() || '');
        });

        const limited = all.slice(0, total);

        if (this.formData.subject === "LANG") {
          this.excLANG = limited;
        } else {
          this.excMATH = limited;
        }
      },
      error: (err) => {
        console.error("Error final al generar ejercicios:", err);
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


  getMaterialApoyo() {
    const form = { ...this.formData, contents: this.formData.contents.toLowerCase() }

    this.mainService.getMaterialApoyo(form).subscribe({
      next: (res) => {

      }
    })
  }


}
