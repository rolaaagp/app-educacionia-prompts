import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import katex from 'katex';

@Component({
  selector: 'app-language',
  imports: [CommonModule],
  templateUrl: './language.component.html',
  styleUrl: './language.component.css'
})
export class LanguageComponent {
  ejercicios = [{ "id": 1, "type": "multiple_choice", "question": "¿Cuál de los siguientes NO es un aspecto clave de la alfabetización mediática?", "options": ["Analizar los mensajes de los medios", "Evaluar las fuentes de los medios", "Consumir pasivamente el contenido de los medios", "Comprender la influencia de los medios en la sociedad"], "answer": 2 }, { "id": 2, "type": "open_ended", "question": "Describe cómo las representaciones en los medios pueden moldear nuestras percepciones de género, raza o clase social. Proporciona un ejemplo específico para respaldar tu respuesta.", "options": null, "answer": "Las representaciones en los medios pueden reforzar estereotipos y prejuicios al retratar repetidamente a ciertos grupos de manera limitada o unidimensional. Por ejemplo, la falta de representaciones diversas y matizadas de las mujeres en muchos medios puede contribuir a la perpetuación de los estereotipos de género." }, { "id": 3, "type": "multiple_choice", "question": "¿Cuál es el propósito principal de la educación en alfabetización mediática?", "options": ["Fomentar el consumo pasivo de medios", "Promover la creación de contenido mediático", "Desarrollar habilidades de pensamiento crítico sobre los medios", "Asegurar que las empresas de medios rindan cuentas"], "answer": 2 }, { "id": 4, "type": "open_ended", "question": "Explica cómo el auge de las redes sociales ha impactado la forma en que se comparte y consume la información. Discute tanto las consecuencias positivas como las negativas.", "options": null, "answer": "Las redes sociales han democratizado el intercambio de información, permitiendo que los individuos creen y distribuyan contenido fácilmente. Esto ha llevado a la difusión de diversas perspectivas, pero también a la proliferación de desinformación y cámaras de eco. Las redes sociales también han difuminado los límites entre la comunicación personal y pública, impactando la privacidad y la dinámica social." }, { "id": 5, "type": "multiple_choice", "question": "¿Cuál de las siguientes es una habilidad importante para analizar críticamente los mensajes de los medios?", "options": ["Identificar el público objetivo", "Reconocer los recursos emocionales", "Evaluar la credibilidad de las fuentes", "Todas las anteriores"], "answer": 3 }]

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = 'A'
  }
}
