import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
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

import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { replaceLatex1 } from './shared/latex-utils';

import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { PDFExportModule } from "@progress/kendo-angular-pdf-export";
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';

export type Exercise = {
  id: number;
  type: "open_ended" | "multiple_choice";
  question: string;
  options: string[] | null;
  answer: string | number;
  userAnswer?: string | number;
};


declare const MathJax: any;


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, PDFExportModule, HttpClientModule, LanguageComponent, MathComponent, SkeletonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {
  email: string = 'rgarcia@nexia.cl';
  isLoggedInWS: boolean = false;
  onKnow: boolean = false;
  user!: GetUserByEmailResponse["data"];

  language: boolean = false;

  formData: IBody = {
    user_id: 1,
    course: '2M',
    subject: 'MATH',
    contents: '',
    quantity_exercise: 20,
    typeQuestions: "dev",
    mood: "neutro"
  };

  excLANG!: Exercise[];
  excMATH!: Exercise[];

  t: string = "";

  loading = false;


  materialApoyo!: SafeHtml;
  private needsTypeset = false;

  replaceLatex = replaceLatex1;

  sanitizer!: any;

  @ViewChild('pdfExport') private pdfExport!: PDFExportComponent;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly _userService: UserService,
    private readonly socketService: SocketService,
    private readonly mainService: MainService,
    private cdr: ChangeDetectorRef,
    private sanitizerDom: DomSanitizer
  ) {
    this.sanitizer = sanitizerDom;
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) this.updateMathJax();
  }

  ngAfterViewChecked() {
    if (this.isBrowser && this.needsTypeset && typeof MathJax !== 'undefined') {
      this.needsTypeset = false;
      MathJax.typesetClear?.();
      MathJax.typesetPromise().catch((err: any) => console.error('MathJax', err));
    }
  }

  ngOnChanges(): void {
    if (this.isBrowser) this.updateMathJax();
  }

  async ngOnInit() {
    this.excLANG = [
      {
        "id": 7291,
        "type": "open_ended",
        "question": "Analiza el uso del realismo mágico en el cuento 'La noche boca arriba' de Julio Cortázar. ¿Cómo contribuye este elemento a la atmósfera y al mensaje del relato?",
        "options": null,
        "answer": ""
      },
      {
        "id": 5384,
        "type": "open_ended",
        "question": "Compara y contrasta el tratamiento del tema del amor en el poema 'Soneto LXVI' de Pablo Neruda y 'A Julia de Burgos' de Julia de Burgos. ¿Qué diferencias y similitudes encuentras en la expresión lírica de ambos autores?",
        "options": null,
        "answer": ""
      },
      {
        "id": 1629,
        "type": "open_ended",
        "question": "Analiza el papel de la figura femenina en la obra teatral 'La casa de Bernarda Alba' de Federico García Lorca. ¿Cómo se representa la opresión y la rebeldía a través de los personajes femeninos?",
        "options": null,
        "answer": ""
      },
      {
        "id": 9047,
        "type": "open_ended",
        "question": "Examina un artículo de opinión reciente de un periódico nacional sobre un tema de actualidad. Identifica y explica las estrategias retóricas utilizadas por el autor para persuadir a los lectores.",
        "options": null,
        "answer": ""
      },
      {
        "id": 3816,
        "type": "open_ended",
        "question": "Analiza la representación de la identidad latinoamericana en el cuento 'El ahogado más hermoso del mundo' de Gabriel García Márquez. ¿Cómo se refleja la cultura y las tradiciones de la región en la narrativa?",
        "options": null,
        "answer": ""
      },
      {
        "id": 3721,
        "type": "open_ended",
        "question": "Analiza el uso del tiempo narrativo en el cuento 'El sur' de Jorge Luis Borges. ¿Cómo influye la manipulación temporal en la percepción del lector sobre la realidad y la ficción en la historia?",
        "options": null,
        "answer": ""
      },
      {
        "id": 5892,
        "type": "open_ended",
        "question": "Compara el tratamiento de la naturaleza en el poema 'Oda a la tierra' de Pablo Neruda y 'Yo soy un árbol' de Juana de Ibarbourou. ¿Cómo se refleja la relación entre el ser humano y el entorno natural en ambas obras?",
        "options": null,
        "answer": ""
      },
      {
        "id": 1047,
        "type": "open_ended",
        "question": "Examina el uso del lenguaje coloquial y los modismos en la obra teatral 'La nona' de Roberto Cossa. ¿De qué manera estos elementos contribuyen a la caracterización de los personajes y a la representación de la sociedad argentina?",
        "options": null,
        "answer": ""
      },
      {
        "id": 7634,
        "type": "open_ended",
        "question": "Analiza la estructura y el contenido de un reportaje multimedia reciente sobre un tema de interés social. ¿Cómo se integran los diferentes elementos (texto, imágenes, videos, infografías) para transmitir la información de manera efectiva?",
        "options": null,
        "answer": ""
      },
      {
        "id": 2958,
        "type": "open_ended",
        "question": "Investiga y analiza el uso de la intertextualidad en el cuento 'Continuidad de los parques' de Julio Cortázar. ¿Cómo se relaciona la narrativa del cuento con otros textos o formas artísticas, y qué efecto produce esta técnica en la interpretación de la obra?",
        "options": null,
        "answer": ""
      },
      {
        "id": 6234,
        "type": "open_ended",
        "question": "Analiza el uso de la metáfora en el cuento 'La noche de los feos' de Mario Benedetti. ¿Cómo contribuye este recurso literario a la exploración de los temas de la belleza y la aceptación social en la obra?",
        "options": null,
        "answer": ""
      },
      {
        "id": 8901,
        "type": "open_ended",
        "question": "Compara el tratamiento del tema de la muerte en el poema 'Masa' de César Vallejo y 'Coplas por la muerte de su padre' de Jorge Manrique. ¿Qué diferencias y similitudes encuentras en la perspectiva de ambos autores sobre este tema universal?",
        "options": null,
        "answer": ""
      },
      {
        "id": 3567,
        "type": "open_ended",
        "question": "Examina el uso del humor y la sátira en la obra teatral 'Saverio el cruel' de Roberto Arlt. ¿Cómo emplea el autor estos recursos para criticar la sociedad argentina de su época?",
        "options": null,
        "answer": ""
      },
      {
        "id": 7123,
        "type": "open_ended",
        "question": "Analiza la estructura y el contenido de una crónica periodística reciente sobre un evento cultural en tu comunidad. ¿Cómo logra el autor equilibrar la información objetiva con su perspectiva personal para crear un texto atractivo y significativo?",
        "options": null,
        "answer": ""
      },
      {
        "id": 4890,
        "type": "open_ended",
        "question": "Investiga y analiza el uso del monólogo interior en el cuento 'El pozo' de Juan Carlos Onetti. ¿De qué manera esta técnica narrativa contribuye a la exploración de la psicología del personaje principal y a la atmósfera general de la obra?",
        "options": null,
        "answer": ""
      },
      {
        "id": 2347,
        "type": "open_ended",
        "question": "Analiza el uso del tiempo cíclico en el cuento 'La noche boca arriba' de Julio Cortázar. ¿Cómo influye esta estructura temporal en la percepción de la realidad y el sueño en la narrativa?",
        "options": null,
        "answer": ""
      },
      {
        "id": 5981,
        "type": "open_ended",
        "question": "Compara el tratamiento del amor en el poema 'Puedo escribir los versos más tristes esta noche' de Pablo Neruda y 'A una rosa' de Sor Juana Inés de la Cruz. ¿Qué diferencias y similitudes encuentras en la expresión del sentimiento amoroso entre ambos autores?",
        "options": null,
        "answer": ""
      },
      {
        "id": 7634,
        "type": "open_ended",
        "question": "Examina el uso del lenguaje poético en la obra teatral 'La casa de Bernarda Alba' de Federico García Lorca. ¿Cómo contribuye este recurso a la creación de atmósferas y a la caracterización de los personajes?",
        "options": null,
        "answer": ""
      },
      {
        "id": 3092,
        "type": "open_ended",
        "question": "Analiza la estructura y el contenido de un editorial reciente sobre un tema de actualidad nacional. ¿Cómo utiliza el autor recursos retóricos y argumentativos para persuadir al lector sobre su punto de vista?",
        "options": null,
        "answer": ""
      },
      {
        "id": 9105,
        "type": "open_ended",
        "question": "Investiga y analiza el uso del realismo mágico en el cuento 'Un señor muy viejo con unas alas enormes' de Gabriel García Márquez. ¿De qué manera este elemento narrativo contribuye a la crítica social presente en la obra?",
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

    this.changeSubject();

    if (this.isBrowser) {


      this.formatearMaterialApoyo("<div style=\"margin: 0 1cm;\">\n\n<style>\n  /* Margen vertical de 24 pt entre párrafos */\n  p { margin: 24pt 0; }\n</style>\n\n# MATERIAL DE APOYO\n\n<p><strong>Temas:</strong><br/>\nFunciones, ecuaciones, proporcionalidad, geometría y probabilidades.</p>\n\n## Preguntas:\n\n1. **Descubriendo patrones en funciones lineales**  \n   <p>Contextualización: Las funciones lineales están en todas partes, desde calcular el costo de una llamada telefónica hasta predecir el crecimiento de una población. Entenderlas te ayudará a analizar situaciones cotidianas.</p>\n\n   **Desarrollo paso a paso:**\n\n   <p>\n       1. Identifica dos puntos en la función.<br/>\n       2. Calcula la pendiente usando la fórmula [math]m = \\frac{y_2 - y_1}{x_2 - x_1}[/math].<br/>\n       3. Usa un punto y la pendiente para escribir la ecuación [math]y = mx + b[/math].  \n   </p>\n\n   <p><strong>Consejo:</strong><br/>\n   Dibuja la línea para visualizar mejor la relación entre las variables. Recuerda, cada punto en esa línea tiene una historia que contar.</p>\n\n2. **Resolviendo ecuaciones cuadráticas con factorización**  \n   <p>Contextualización: Las ecuaciones cuadráticas aparecen en problemas de física, como el movimiento de proyectiles, o en economía, al calcular puntos de equilibrio. Dominarlas te abrirá puertas en muchas áreas.</p>\n\n   **Desarrollo paso a paso:**\n\n   <p>\n       1. Escribe la ecuación en la forma [math]ax^2 + bx + c = 0[/math].<br/>\n       2. Factoriza la expresión cuadrática.<br/>\n       3. Aplica la propiedad del producto cero para encontrar las soluciones.  \n   </p>\n\n   <p><strong>Consejo:</strong><br/>\n   Practica la factorización con diferentes tipos de expresiones. Es como armar un rompecabezas: al principio puede parecer difícil, pero con práctica, verás patrones y se volverá más fácil.</p>\n\n3. **Aplicando proporcionalidad en recetas de cocina**  \n   <p>Contextualización: La proporcionalidad es crucial en la cocina. Saber ajustar las cantidades de una receta te permitirá cocinar para diferentes números de personas sin perder el sabor original.</p>\n\n   **Desarrollo paso a paso:**\n\n   <p>\n       1. Identifica la razón entre la cantidad original y la nueva cantidad deseada.<br/>\n       2. Multiplica cada ingrediente por esta razón.<br/>\n       3. Redondea los resultados a unidades prácticas de medida.  \n   </p>\n\n   <p><strong>Consejo:</strong><br/>\n   Usa esta habilidad en tu vida diaria. Podrías sorprenderte al ver cuántas situaciones cotidianas involucran proporciones.</p>\n\n4. **Calculando áreas de figuras compuestas**  \n   <p>Contextualización: En arquitectura y diseño, a menudo se trabaja con formas complejas. Saber calcular áreas de figuras compuestas te ayudará a entender mejor los espacios y a planificar proyectos.</p>\n\n   **Desarrollo paso a paso:**\n\n   <p>\n       1. Divide la figura compuesta en formas geométricas básicas.<br/>\n       2. Calcula el área de cada forma individual.<br/>\n       3. Suma las áreas individuales para obtener el área total.  \n   </p>\n\n   <p><strong>Consejo:</strong><br/>\n   Practica descomponiendo objetos cotidianos en formas básicas. Este ejercicio mental mejorará tu percepción espacial y tu creatividad.</p>\n\n5. **Analizando probabilidades en juegos de azar**  \n   <p>Contextualización: Entender las probabilidades te ayuda a tomar decisiones informadas, ya sea en juegos de azar o en situaciones de la vida real donde hay incertidumbre.</p>\n\n   **Desarrollo paso a paso:**\n\n   <p>\n       1. Identifica todos los resultados posibles.<br/>\n       2. Cuenta los resultados favorables.<br/>\n       3. Divide los resultados favorables entre el total de resultados posibles.  \n   </p>\n\n   <p><strong>Consejo:</strong><br/>\n   Recuerda que en la vida real, las probabilidades no siempre garantizan un resultado. Úsalas como una herramienta para tomar decisiones, pero siempre considera otros factores.</p>\n\n</div>");
      this.updateMathJax();
      const user = JSON.parse(localStorage.getItem("userEDUCACIONIA") as string) as GetUserByEmailResponse["data"];
      if (user) {
        this.user = user;
        this.formData.user_id = user.user_id;
      }

      this.socketService.setUserMessageSubject(this._userService.message);
      this.socketService.connect("wss://soc-api-educacion.csff.cl");

      this.socketService.getWebsocketID(this.formData.user_id)

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

            if (payload.action == "getSupportMaterialsResponse") {
              const data = payload.data;
              console.log("Data getSupportMaterialsResponse", data)
              this.formatearMaterialApoyo(data);
              this.cdr.detectChanges();
            }

          } catch (error) {
            console.error('Error al procesar mensaje de socket:', error);
          }
        }

      });

      this.isLoggedInWS = await this.socketService.startWSConnection();
    }
  }


  private formatearMaterialApoyo(rawMarkdown: string) {
    const rawHtml = marked.parse(rawMarkdown);
    const htmlWithKatex = replaceLatex1(rawHtml as string);
    this.materialApoyo = this.sanitizerDom.bypassSecurityTrustHtml(htmlWithKatex);
    this.cdr.detectChanges();
  }

  private updateMathJax(): void {
    if (!this.isBrowser || typeof MathJax === 'undefined') {
      return;
    }

    if (MathJax.typesetPromise) {
      MathJax.typesetClear?.();
      MathJax.typesetPromise().catch((err: any) => console.error('MathJax error', err));
      return;
    }

    if (MathJax.Hub && MathJax.Hub.Queue) {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
    }
  }

  changeSubject() {
    this.formData.contents = this.formData.subject === "LANG"
      ? `Cuentos latinoamericanos modernos y contemporáneos.
Poemas líricos clásicos y modernos.
Obras dramáticas hispanoamericanas.
Textos periodísticos y mediáticos.`
      : `funciones, ecuaciones, proporcionalidad, geometría o probabilidades`;
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
    const form = { ...this.formData, contents: this.formData.contents.toLowerCase(), ex: this.excMATH }

    this.mainService.getMaterialApoyo(form).subscribe({
      next: (res) => {
      }
    })
  }

  async exportarPDF(): Promise<void> {
    if (!this.isBrowser) { return; }

    if (typeof MathJax !== 'undefined' && MathJax.startup?.promise) {
      await MathJax.startup.promise;
    }
    await new Promise(r => setTimeout(r, 100));

    this.pdfExport.saveAs(`material_apoyo_${this.formData.subject}.pdf`);

  }


  async exportarPDF1(): Promise<void> {
    if (!this.isBrowser) return;

    const container = document.getElementById('materialApoyo');
    if (!container) {
      console.warn('No se encontró #materialApoyo');
      return;
    }

    // 1. Asegurarse de que MathJax haya rendereado todas las fórmulas
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      await MathJax.typesetPromise();
    }

    // 2. Importar jsPDF en caliente
    const [{ default: jsPDF }] = await Promise.all([
      import('jspdf')
    ]);

    // 3. Crear el documento
    const pdf = new jsPDF({
      unit: 'pt',
      orientation: 'p'
    });

    // 4. Renderizar el HTML como vectores/texto
    await pdf.html(container, {
      x: 40,  // margen izquierdo
      y: 40,  // margen superior
      width: pdf.internal.pageSize.getWidth() - 80,
      windowWidth: document.body.scrollWidth,
      callback: () => {
        // 5. Una vez terminado, guardar el PDF
        pdf.save('Material_de_Apoyo.pdf');
      }
    });
  }




}
