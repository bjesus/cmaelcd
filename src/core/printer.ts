/**
 * Pretty-printer for CMAEL(CD) formulas.
 * Produces human-readable ASCII output.
 */

import { type Formula, type FormulaSet } from "./types.ts";

/**
 * Print a formula to a human-readable string.
 * Uses the same syntax accepted by the parser:
 *   ¬ → ~, ∧ → &, D_A → D{...}, C_A → C{...}
 */
export function printFormula(f: Formula): string {
  switch (f.kind) {
    case "atom":
      return f.name;

    case "not":
      // Check if it's ¬(φ ∧ ψ) — print as ~(φ & ψ)
      if (f.sub.kind === "and" || f.sub.kind === "not") {
        return `~(${printFormula(f.sub)})`;
      }
      return `~${printFormula(f.sub)}`;

    case "and":
      return `(${printFormula(f.left)} & ${printFormula(f.right)})`;

    case "D":
      if (f.coalition.length === 1) {
        // Individual knowledge: D{a} φ → Ka φ
        return `K${f.coalition[0]} ${printFormulaWrapped(f.sub)}`;
      }
      return `D{${f.coalition.join(",")}} ${printFormulaWrapped(f.sub)}`;

    case "C":
      return `C{${f.coalition.join(",")}} ${printFormulaWrapped(f.sub)}`;
  }
}

/**
 * Print a formula, wrapping it in parens if it's compound.
 */
function printFormulaWrapped(f: Formula): string {
  if (f.kind === "and" || (f.kind === "not" && (f.sub.kind === "and"))) {
    return `(${printFormula(f)})`;
  }
  return printFormula(f);
}

/**
 * Print a formula using Unicode mathematical symbols for display.
 */
export function printFormulaUnicode(f: Formula): string {
  switch (f.kind) {
    case "atom":
      return f.name;

    case "not":
      if (f.sub.kind === "and" || f.sub.kind === "not") {
        return `\u00AC(${printFormulaUnicode(f.sub)})`;
      }
      return `\u00AC${printFormulaUnicode(f.sub)}`;

    case "and":
      return `(${printFormulaUnicode(f.left)} \u2227 ${printFormulaUnicode(f.right)})`;

    case "D":
      if (f.coalition.length === 1) {
        return `K${f.coalition[0]} ${printFormulaUnicodeWrapped(f.sub)}`;
      }
      return `D{${f.coalition.join(",")}} ${printFormulaUnicodeWrapped(f.sub)}`;

    case "C":
      return `C{${f.coalition.join(",")}} ${printFormulaUnicodeWrapped(f.sub)}`;
  }
}

function printFormulaUnicodeWrapped(f: Formula): string {
  if (f.kind === "and" || (f.kind === "not" && (f.sub.kind === "and"))) {
    return `(${printFormulaUnicode(f)})`;
  }
  return printFormulaUnicode(f);
}

/**
 * Print a formula set as a comma-separated list in braces.
 */
export function printFormulaSet(fs: FormulaSet): string {
  const items = fs.toArray().map(printFormula);
  return `{${items.join(", ")}}`;
}

/**
 * Print a formula set using compact notation.
 */
export function printFormulaSetCompact(fs: FormulaSet): string {
  const items = fs.toArray().map(printFormula);
  return `{${items.join(", ")}}`;
}

// ============================================================
// LaTeX output (for KaTeX rendering in browser)
// ============================================================

/**
 * Graduated delimiter sizes by nesting depth.
 * depth 0: plain (/ )
 * depth 1: \bigl / \bigr
 * depth 2: \Bigl / \Bigr
 * depth 3: \biggl / \biggr
 * depth 4+: \Biggl / \Biggr (largest available)
 */
const DELIM_SIZES: [string, string][] = [
  ["", ""],             // depth 0: plain parens
  ["\\bigl", "\\bigr"],
  ["\\Bigl", "\\Bigr"],
  ["\\biggl", "\\biggr"],
  ["\\Biggl", "\\Biggr"],
];

function delimPair(depth: number): [string, string] {
  const idx = Math.min(depth, DELIM_SIZES.length - 1);
  return DELIM_SIZES[idx]!;
}

function lparen(depth: number): string {
  const [l] = delimPair(depth);
  return l ? `${l}(` : "(";
}

function rparen(depth: number): string {
  const [, r] = delimPair(depth);
  return r ? `${r})` : ")";
}

/**
 * Compute the maximum parenthesis nesting depth of a formula.
 * This counts explicit parenthesized groups (and, negated-and, wrapped operands).
 */
function parenDepth(f: Formula): number {
  switch (f.kind) {
    case "atom":
      return 0;
    case "not":
      if (f.sub.kind === "and" || f.sub.kind === "not") {
        // ¬(sub) — adds a paren layer around sub
        return 1 + parenDepth(f.sub);
      }
      return parenDepth(f.sub);
    case "and":
      // (left ∧ right) — adds a paren layer
      return 1 + Math.max(parenDepth(f.left), parenDepth(f.right));
    case "D":
    case "C":
      // Operator wraps sub in parens only if sub is compound
      if (f.sub.kind === "and" || (f.sub.kind === "not" && f.sub.sub.kind === "and")) {
        return 1 + parenDepth(f.sub);
      }
      return parenDepth(f.sub);
  }
}

/**
 * Print a formula as a LaTeX string suitable for KaTeX rendering.
 * Uses graduated delimiter sizes so nested parentheses are visually distinct.
 */
export function printFormulaLatex(f: Formula): string {
  const maxDepth = parenDepth(f);
  return printFormulaLatexInner(f, maxDepth);
}

function printFormulaLatexInner(f: Formula, outerDepth: number): string {
  switch (f.kind) {
    case "atom":
      return f.name;

    case "not":
      if (f.sub.kind === "and" || f.sub.kind === "not") {
        const innerDepth = parenDepth(f.sub);
        const myDepth = outerDepth - 1;
        return `\\neg${lparen(myDepth)}${printFormulaLatexInner(f.sub, innerDepth)}${rparen(myDepth)}`;
      }
      return `\\neg ${printFormulaLatexInner(f.sub, outerDepth)}`;

    case "and": {
      const myDepth = outerDepth - 1;
      const leftDepth = parenDepth(f.left);
      const rightDepth = parenDepth(f.right);
      return `${lparen(myDepth)}${printFormulaLatexInner(f.left, leftDepth)} \\wedge ${printFormulaLatexInner(f.right, rightDepth)}${rparen(myDepth)}`;
    }

    case "D":
      if (f.coalition.length === 1) {
        return `\\mathbf{K}_{${f.coalition[0]}} ${printFormulaLatexWrappedInner(f.sub, outerDepth)}`;
      }
      return `\\mathbf{D}_{\\{${f.coalition.join(",")}\\}} ${printFormulaLatexWrappedInner(f.sub, outerDepth)}`;

    case "C":
      return `\\mathbf{C}_{\\{${f.coalition.join(",")}\\}} ${printFormulaLatexWrappedInner(f.sub, outerDepth)}`;
  }
}

function printFormulaLatexWrappedInner(f: Formula, outerDepth: number): string {
  if (f.kind === "and" || (f.kind === "not" && f.sub.kind === "and")) {
    const innerDepth = parenDepth(f);
    const myDepth = outerDepth - 1;
    return `${lparen(myDepth)}${printFormulaLatexInner(f, innerDepth)}${rparen(myDepth)}`;
  }
  return printFormulaLatexInner(f, outerDepth);
}

/**
 * Print a formula set as LaTeX.
 */
export function printFormulaSetLatex(fs: FormulaSet): string {
  const items = fs.toArray().map(printFormulaLatex);
  return `\\left\\{${items.join(",\\; ")}\\right\\}`;
}
