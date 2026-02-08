/**
 * Text-based visualization of tableau results for CLI output.
 * Also generates DOT (Graphviz) format for graph rendering.
 */

import {
  type Pretableau,
  type Tableau,
  type TableauResult,
  type Formula,
  type FormulaSet,
} from "../core/types.ts";
import { printFormula, printFormulaSet, printFormulaUnicode } from "../core/printer.ts";
import { agentsInFormula } from "../core/formula.ts";

/**
 * Generate a complete text summary of a tableau result.
 */
export function textSummary(result: TableauResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("CMAEL(CD) Tableau Decision Procedure");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`Input formula: ${printFormula(result.inputFormula)}`);
  const agents = [...agentsInFormula(result.inputFormula)].sort();
  lines.push(`Agents: {${agents.join(", ")}}`);
  lines.push("");

  // Pretableau summary
  lines.push("--- Phase 1: Construction (Pretableau) ---");
  lines.push(`  Prestates: ${result.pretableau.prestates.size}`);
  lines.push(`  States: ${result.pretableau.states.size}`);
  lines.push(`  Dashed edges (search): ${result.pretableau.dashedEdges.length}`);
  lines.push(`  Solid edges (transitions): ${result.pretableau.solidEdges.length}`);
  lines.push("");

  // Initial tableau summary
  lines.push("--- Phase 2: Prestate Elimination (Initial Tableau) ---");
  lines.push(`  States: ${result.initialTableau.states.size}`);
  lines.push(`  Edges: ${result.initialTableau.edges.length}`);
  lines.push("");

  // Final tableau summary
  lines.push("--- Phase 3: State Elimination (Final Tableau) ---");
  lines.push(`  States: ${result.finalTableau.states.size}`);
  lines.push(`  Edges: ${result.finalTableau.edges.length}`);
  lines.push("");

  // Result
  lines.push("=".repeat(60));
  if (result.satisfiable) {
    lines.push("RESULT: SATISFIABLE");
    lines.push("");
    lines.push("Satisfying states:");
    for (const [id, state] of result.finalTableau.states) {
      if (state.formulas.has(result.inputFormula)) {
        lines.push(`  ${id}: ${printFormulaSet(state.formulas)}`);
      }
    }
  } else {
    lines.push("RESULT: UNSATISFIABLE");
  }
  lines.push("=".repeat(60));

  return lines.join("\n");
}

/**
 * Generate verbose text showing all states in each phase.
 */
export function textVerbose(result: TableauResult): string {
  const lines: string[] = [textSummary(result), ""];

  // Pretableau detail
  lines.push("=== Pretableau States ===");
  for (const [id, state] of result.pretableau.states) {
    lines.push(`  ${id}: ${printFormulaSet(state.formulas)}`);
  }
  lines.push("");
  lines.push("=== Pretableau Prestates ===");
  for (const [id, ps] of result.pretableau.prestates) {
    lines.push(`  ${id}: ${printFormulaSet(ps.formulas)}`);
  }
  lines.push("");

  // Initial tableau states
  lines.push("=== Initial Tableau States ===");
  for (const [id, state] of result.initialTableau.states) {
    lines.push(`  ${id}: ${printFormulaSet(state.formulas)}`);
  }
  lines.push("");
  lines.push("=== Initial Tableau Edges ===");
  for (const edge of result.initialTableau.edges) {
    lines.push(`  ${edge.from} --[${printFormula(edge.label)}]--> ${edge.to}`);
  }
  lines.push("");

  // Final tableau states
  lines.push("=== Final Tableau States ===");
  if (result.finalTableau.states.size === 0) {
    lines.push("  (empty)");
  }
  for (const [id, state] of result.finalTableau.states) {
    lines.push(`  ${id}: ${printFormulaSet(state.formulas)}`);
  }
  lines.push("");
  lines.push("=== Final Tableau Edges ===");
  if (result.finalTableau.edges.length === 0) {
    lines.push("  (none)");
  }
  for (const edge of result.finalTableau.edges) {
    lines.push(`  ${edge.from} --[${printFormula(edge.label)}]--> ${edge.to}`);
  }

  return lines.join("\n");
}

/**
 * Format a formula set for DOT tooltip (one formula per line).
 * Uses real newlines — escDot will convert them to DOT \n.
 */
function formulaSetTooltip(fs: FormulaSet): string {
  return fs.toArray().map(printFormulaUnicode).join("\n");
}

/**
 * Generate a compact label for a state: its ID and count of formulas.
 * Uses real newlines — escDot will convert them to DOT \n.
 */
function compactLabel(id: string, fs: FormulaSet): string {
  return `${id}\n(${fs.size} formulas)`;
}

/**
 * Generate DOT (Graphviz) format for a tableau.
 * Uses compact node labels with full formula sets available in tooltips.
 */
export function toDot(result: TableauResult, phase: "pretableau" | "initial" | "final" = "final"): string {
  const lines: string[] = [];
  lines.push("digraph tableau {");
  lines.push("  rankdir=TB;");
  lines.push("  bgcolor=transparent;");
  lines.push('  node [shape=box, style="filled,rounded", fillcolor="#f8f9fa", color="#d0d0d0", fontsize=11, fontname="Helvetica"];');
  lines.push('  edge [fontsize=9, fontname="Helvetica", color="#888"];');
  lines.push("");

  if (phase === "pretableau") {
    // Prestates as dashed ellipses
    for (const [id, ps] of result.pretableau.prestates) {
      const tooltip = formulaSetTooltip(ps.formulas);
      lines.push(`  "${id}" [label="${escDot(compactLabel(id, ps.formulas))}", shape=ellipse, style="dashed,filled", fillcolor="#fafafa", tooltip="${escDot(tooltip)}"];`);
    }
    // States as boxes
    for (const [id, state] of result.pretableau.states) {
      const tooltip = formulaSetTooltip(state.formulas);
      const hasInput = state.formulas.has(result.inputFormula);
      const fill = hasInput ? "#dbeafe" : "#f8f9fa";
      const border = hasInput ? "#93b5e6" : "#d0d0d0";
      lines.push(`  "${id}" [label="${escDot(compactLabel(id, state.formulas))}", fillcolor="${fill}", color="${border}", tooltip="${escDot(tooltip)}"];`);
    }
    // Dashed edges (prestate → state expansion)
    for (const edge of result.pretableau.dashedEdges) {
      lines.push(`  "${edge.from}" -> "${edge.to}" [style=dashed, color="#bbb"];`);
    }
    // Solid edges (state → prestate transitions)
    for (const edge of result.pretableau.solidEdges) {
      const label = printFormulaUnicode(edge.label);
      lines.push(`  "${edge.from}" -> "${edge.to}" [label=" ${escDot(label)} ", fontcolor="#4a6fa5"];`);
    }
  } else {
    const tableau = phase === "initial" ? result.initialTableau : result.finalTableau;

    for (const [id, state] of tableau.states) {
      const tooltip = formulaSetTooltip(state.formulas);
      const hasInput = state.formulas.has(result.inputFormula);
      const fill = hasInput ? "#dcfce7" : "#f8f9fa";
      const border = hasInput ? "#86d997" : "#d0d0d0";
      const penwidth = hasInput ? "2" : "1";
      lines.push(`  "${id}" [label="${escDot(compactLabel(id, state.formulas))}", fillcolor="${fill}", color="${border}", penwidth=${penwidth}, tooltip="${escDot(tooltip)}"];`);
    }

    for (const edge of tableau.edges) {
      const label = printFormulaUnicode(edge.label);
      lines.push(`  "${edge.from}" -> "${edge.to}" [label=" ${escDot(label)} ", fontcolor="#4a6fa5"];`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

function escDot(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
