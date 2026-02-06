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
import { printFormula, printFormulaSet } from "../core/printer.ts";

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
  lines.push(`Agents: {${result.agents.join(", ")}}`);
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
 * Generate DOT (Graphviz) format for a tableau.
 */
export function toDot(result: TableauResult, phase: "pretableau" | "initial" | "final" = "final"): string {
  const lines: string[] = [];
  lines.push("digraph tableau {");
  lines.push("  rankdir=TB;");
  lines.push("  node [shape=box, fontsize=10, fontname=\"monospace\"];");
  lines.push("  edge [fontsize=8, fontname=\"monospace\"];");
  lines.push("");

  if (phase === "pretableau") {
    // Prestates as rounded boxes
    for (const [id, ps] of result.pretableau.prestates) {
      const label = truncateLabel(printFormulaSet(ps.formulas));
      lines.push(`  "${id}" [label="${escDot(label)}", shape=ellipse, style=dashed];`);
    }
    // States as boxes
    for (const [id, state] of result.pretableau.states) {
      const label = truncateLabel(printFormulaSet(state.formulas));
      const color = state.formulas.has(result.inputFormula) ? ", fillcolor=lightblue, style=filled" : "";
      lines.push(`  "${id}" [label="${escDot(label)}"${color}];`);
    }
    // Dashed edges
    for (const edge of result.pretableau.dashedEdges) {
      lines.push(`  "${edge.from}" -> "${edge.to}" [style=dashed];`);
    }
    // Solid edges
    for (const edge of result.pretableau.solidEdges) {
      lines.push(`  "${edge.from}" -> "${edge.to}" [label="${escDot(printFormula(edge.label))}"];`);
    }
  } else {
    const tableau = phase === "initial" ? result.initialTableau : result.finalTableau;
    const eliminated = phase === "final"
      ? new Set([...result.initialTableau.states.keys()].filter(
          (id) => !result.finalTableau.states.has(id)
        ))
      : new Set<string>();

    for (const [id, state] of tableau.states) {
      const label = truncateLabel(printFormulaSet(state.formulas));
      const hasInput = state.formulas.has(result.inputFormula);
      let style = "";
      if (hasInput) {
        style = ", fillcolor=lightgreen, style=filled";
      }
      lines.push(`  "${id}" [label="${escDot(label)}"${style}];`);
    }

    // Show eliminated states in red (only for final view)
    if (phase === "final") {
      for (const id of eliminated) {
        const state = result.initialTableau.states.get(id);
        if (state) {
          const label = truncateLabel(printFormulaSet(state.formulas));
          lines.push(`  "${id}" [label="${escDot(label)}", fillcolor=lightcoral, style="filled,dashed"];`);
        }
      }
    }

    for (const edge of tableau.edges) {
      lines.push(`  "${edge.from}" -> "${edge.to}" [label="${escDot(printFormula(edge.label))}"];`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

function truncateLabel(s: string, maxLen: number = 80): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}

function escDot(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
