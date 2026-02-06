/**
 * Browser entry point for the CMAEL(CD) Tableau Solver.
 * Exports the solver function to the global scope for the HTML page to use.
 */

import { parseFormula } from "../core/parser.ts";
import { printFormula, printFormulaSet, printFormulaLatex, printFormulaSetLatex } from "../core/printer.ts";
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
  return serializeResult(result);
};

function serializeResult(result: TableauResult) {
  const inputKey = result.inputFormula;
  const inputLatex = printFormulaLatex(result.inputFormula);

  function serializeStates(states: typeof result.pretableau.states) {
    const out: Record<string, { formulas: string; formulasLatex: string; hasInput: boolean }> = {};
    for (const [id, state] of states) {
      out[id] = {
        formulas: printFormulaSet(state.formulas),
        formulasLatex: printFormulaSetLatex(state.formulas),
        hasInput: state.formulas.has(inputKey),
      };
    }
    return out;
  }

  function serializeEdges(edges: typeof result.initialTableau.edges) {
    return edges.map((e) => ({
      from: e.from,
      to: e.to,
      label: printFormula(e.label),
      labelLatex: printFormulaLatex(e.label),
    }));
  }

  const pretableauPrestates: Record<string, { formulas: string; formulasLatex: string }> = {};
  for (const [id, ps] of result.pretableau.prestates) {
    pretableauPrestates[id] = {
      formulas: printFormulaSet(ps.formulas),
      formulasLatex: printFormulaSetLatex(ps.formulas),
    };
  }

  return {
    satisfiable: result.satisfiable,
    inputLatex,
    stats: {
      pretableauStates: result.pretableau.states.size,
      pretableauPrestates: result.pretableau.prestates.size,
      initialStates: result.initialTableau.states.size,
      initialEdges: result.initialTableau.edges.length,
      finalStates: result.finalTableau.states.size,
      finalEdges: result.finalTableau.edges.length,
    },
    pretableau: {
      states: serializeStates(result.pretableau.states),
      prestates: pretableauPrestates,
      solidEdges: serializeEdges(result.pretableau.solidEdges),
    },
    initialTableau: {
      states: serializeStates(result.initialTableau.states),
      edges: serializeEdges(result.initialTableau.edges),
    },
    finalTableau: {
      states: serializeStates(result.finalTableau.states),
      edges: serializeEdges(result.finalTableau.edges),
    },
    dots: {
      pretableau: toDot(result, "pretableau"),
      initial: toDot(result, "initial"),
      final: toDot(result, "final"),
    },
  };
}
