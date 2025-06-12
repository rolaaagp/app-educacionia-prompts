export function renderEvaluacion(evaluacion: string): string[] {
  const replaced = replaceLatex(evaluacion);
  return replaced.split(/<br\s*\/?>|\n+/).map(t => t.trim()).filter(Boolean);
}


export function replaceLatex(input: string): string {
  if (!input || typeof input !== 'string') return input;
  const LATEX_COMMANDS_REGEX = /(frac|rac|triangle|Diamond|implies|colon|quad|binom|dfrac|tfrac|sqrt|root|sum|prod|int|lim|log|ln|exp|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|min|max|arg|deg|det|dim|mod|gcd|lcm|circ|cdot|cdots|ldots|vdots|ddots|forall|exists|nexists|infty|partial|nabla|pm|mp|leq|geq|neq|approx|equiv|propto|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|mapsto|hookrightarrow|hookleftarrow|uparrow|downarrow|updownarrow|longrightarrow|longleftarrow|Longrightarrow|Longleftarrow|longleftrightarrow|overline|underline|vec|hat|tilde|bar|dot|ddot|text|boxed)/;

  const escapeLatex = (expr: string): string => {
    expr = expr
      .replace(/\\circle/g, '\\circ')
      .replace(/\\rhombus/g, '\\Diamond')
      .replace(/\\cuadrado/g, '\\square');

    if (new RegExp(`\\\\${LATEX_COMMANDS_REGEX.source}`).test(expr)) {
      return expr.trim();
    }

    return expr
      .replace(new RegExp(`(?<!\\\\)${LATEX_COMMANDS_REGEX.source}`, 'g'), '\\$1')
      .trim();
  };


  return input.replace(/\[math\]([\s\S]+?)\[\/math\]/g, (_m, expr) => {
    const cleaned = escapeLatex(expr.trim());
    return `\\(${cleaned}\\)`;
  });
}

import katex from 'katex';

export function replaceLatex1(html: string): string {
  return html.replace(
    /\[math\]([\s\S]+?)\[\/math\]/g,
    (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          throwOnError: false,
          displayMode: false
        });
      } catch {
        return tex;
      }
    }
  );
}
