/**
 * Browser entry point for the CMAEL(CD) Tableau Solver.
 * Exports the solver function to the global scope for the HTML page to use.
 */

import { parseFormula } from "../core/parser.ts";
import { printFormula, printFormulaSet } from "../core/printer.ts";
import { runTableau } from "../core/tableau.ts";
import { toDot } from "../viz/text.ts";
import type { Coalition, TableauResult } from "../core/types.ts";

// Expose solver to the global scope for the HTML page
(globalThis as any).solveFormula = function (
  formulaStr: string,
  agentsStr: string,
  restrictedCuts: boolean
) {
  const formula = parseFormula(formulaStr);

  let agents: Coalition | undefined;
  if (agentsStr) {
    agents = agentsStr
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .sort();
  }

  const result = runTableau(formula, agents, restrictedCuts);

  // Convert to a serializable format for the HTML page
  return serializeResult(result);
};

function serializeResult(result: TableauResult) {
  const inputKey = result.inputFormula;

  // Serialize pretableau
  const pretableauStates: Record<string, { formulas: string; hasInput: boolean }> = {};
  for (const [id, state] of result.pretableau.states) {
    pretableauStates[id] = {
      formulas: printFormulaSet(state.formulas),
      hasInput: state.formulas.has(inputKey),
    };
  }
  const pretableauPrestates: Record<string, { formulas: string }> = {};
  for (const [id, ps] of result.pretableau.prestates) {
    pretableauPrestates[id] = {
      formulas: printFormulaSet(ps.formulas),
    };
  }

  // Serialize initial tableau
  const initialStates: Record<string, { formulas: string; hasInput: boolean }> = {};
  for (const [id, state] of result.initialTableau.states) {
    initialStates[id] = {
      formulas: printFormulaSet(state.formulas),
      hasInput: state.formulas.has(inputKey),
    };
  }
  const initialEdges = result.initialTableau.edges.map((e) => ({
    from: e.from,
    to: e.to,
    label: printFormula(e.label),
  }));

  // Serialize final tableau
  const finalStates: Record<string, { formulas: string; hasInput: boolean }> = {};
  for (const [id, state] of result.finalTableau.states) {
    finalStates[id] = {
      formulas: printFormulaSet(state.formulas),
      hasInput: state.formulas.has(inputKey),
    };
  }
  const finalEdges = result.finalTableau.edges.map((e) => ({
    from: e.from,
    to: e.to,
    label: printFormula(e.label),
  }));

  return {
    satisfiable: result.satisfiable,
    stats: {
      pretableauStates: result.pretableau.states.size,
      pretableauPrestates: result.pretableau.prestates.size,
      initialStates: result.initialTableau.states.size,
      initialEdges: result.initialTableau.edges.length,
      finalStates: result.finalTableau.states.size,
      finalEdges: result.finalTableau.edges.length,
    },
    pretableau: {
      states: pretableauStates,
      prestates: pretableauPrestates,
      solidEdges: result.pretableau.solidEdges.map((e) => ({
        from: e.from,
        to: e.to,
        label: printFormula(e.label),
      })),
    },
    initialTableau: { states: initialStates, edges: initialEdges },
    finalTableau: { states: finalStates, edges: finalEdges },
    dots: {
      pretableau: toDot(result, "pretableau"),
      initial: toDot(result, "initial"),
      final: toDot(result, "final"),
    },
  };
}
