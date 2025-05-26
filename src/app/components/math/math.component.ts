import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import katex from 'katex';

@Component({
  selector: 'app-math',
  imports: [CommonModule],
  templateUrl: './math.component.html',
  styleUrl: './math.component.css'
})
export class MathComponent {

  ejercicios = [{ "id": 1, "type": "open_ended", "question": "Resuelve la siguiente ecuación de segundo grado: [[x^2 - 5x + 6 = 0]]", "options": null, "answer": "[[x = 2, x = 3]]" }, { "id": 2, "type": "multiple_choice", "question": "Si una función lineal pasa por los puntos (2, 3) y (4, 7), ¿cuál es su ecuación?", "options": ["[[y = 2x + 1]]", "[[y = 2x - 1]]", "[[y = 4x - 5]]", "[[y = 4x + 3]]"], "answer": 3 }, { "id": 3, "type": "open_ended", "question": "Un recipiente en forma de cilindro tiene un radio de [[5 text{cm}]] y una altura de [[10 text{cm}]]. Calcula su volumen.", "options": null, "answer": "[[250 pi text{cm}^3]]" }, { "id": 4, "type": "multiple_choice", "question": "Si una magnitud A es directamente proporcional a una magnitud B, y A = 6 cuando B = 3, ¿cuál es el valor de A cuando B = 9?", "options": ["[[A = 18]]", "[[A = 12]]", "[[A = 9]]", "[[A = 6]]"], "answer": 0 }, { "id": 5, "type": "open_ended", "question": "En una urna hay 5 bolas blancas y 3 bolas negras. Si se extrae una bola al azar, ¿cuál es la probabilidad de que sea blanca?", "options": null, "answer": "[[frac{5}{8}]]" }]


  formatLatex(i: string | number): string {
    const input = String(i);
    return input.replace(/\[\[(.+?)\]\]/g, (_match, expr) => {
      // Asegura un solo backslash por comando
      const latex = expr.replace(/([a-zA-Z]+)(?={|\\|$)/g, '\\$1');
      console.log({ latex }); // ← Aquí verás \frac{5}{8}, que es correcto
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    });
  }

  isPureLatex(value: string): boolean {
    return /^\\\(.+\\\)$/.test(value.trim());
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = 'A'
  }
}
