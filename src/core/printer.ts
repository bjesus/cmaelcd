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
        return `K\u2080${subscript(f.coalition[0]!)} ${printFormulaUnicodeWrapped(f.sub)}`;
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

function subscript(s: string): string {
  return s; // Keeping it simple — full subscript conversion is overkill
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
