/**
 * Browser entry point for the CMAEL(CD) Tableau Solver.
 * Exports the solver function to the global scope for the HTML page to use.
 */

import { parseFormula } from "../core/parser.ts";
import { printFormula, printFormulaSet, printFormulaLatex, printFormulaSetLatex, printFormulaUnicode } from "../core/printer.ts";
import { runTableau } from "../core/tableau.ts";
import { toDot, type DotOptions } from "../viz/text.ts";
import type { TableauResult, Formula } from "../core/types.ts";
import { getAtomValuations, getAtoms, agentsInFormula } from "../core/formula.ts";

// Expose solver to the global scope
(globalThis as any).solveFormula = function (
  formulaStr: string,
  _agentsStr: string,
  restrictedCuts: boolean
) {
  const formula = parseFormula(formulaStr);
  return runTableau(formula, restrictedCuts);
};

// Expose DOT generator
(globalThis as any).generateDot = function (
  result: TableauResult,
  phase: "pretableau" | "initial" | "final",
  options: DotOptions
) {
  // If formulaTitle is not provided, use the input formula
  if (!options.formulaTitle) {
    options.formulaTitle = printFormulaUnicode(result.inputFormula);
  }
  return toDot(result, phase, options);
};

// Expose serializer
(globalThis as any).serializeResult = function (result: TableauResult) {
  return serializeResultInternal(result);
};

function extractCoalition(f: Formula): string[] | null {
  if (f.kind === "not" && f.sub.kind === "D") {
    return [...f.sub.coalition];
  }
  return null;
}

function serializeResultInternal(result: TableauResult) {
  const inputKey = result.inputFormula;
  const inputLatex = printFormulaLatex(result.inputFormula);
  const allAgents = [...agentsInFormula(result.inputFormula)].sort();
  const allAtoms = [...getAtoms(result.inputFormula)].sort();

  function serializeStates(states: typeof result.pretableau.states) {
    const out: Record<string, { 
      formulas: string; 
      formulasLatex: string; 
      hasInput: boolean;
      atoms: { name: string; value: boolean }[];
      formulaListLatex: string[];
    }> = {};
    for (const [id, state] of states) {
      const valuations = getAtomValuations(state.formulas);
      const atomList = Object.entries(valuations).map(([name, value]) => ({ name, value }));
      
      out[id] = {
        formulas: printFormulaSet(state.formulas),
        formulasLatex: printFormulaSetLatex(state.formulas),
        hasInput: state.formulas.has(inputKey),
        atoms: atomList,
        formulaListLatex: state.formulas.toArray().map(printFormulaLatex),
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
      coalition: extractCoalition(e.label),
    }));
  }

  const pretableauPrestates: Record<string, { formulas: string; formulasLatex: string }> = {};
  for (const [id, ps] of result.pretableau.prestates) {
    pretableauPrestates[id] = {
      formulas: printFormulaSet(ps.formulas),
      formulasLatex: printFormulaSetLatex(ps.formulas),
    };
  }

  // Serialize elimination records
  const eliminations = result.eliminations.map((rec) => ({
    stateId: rec.stateId,
    rule: rec.rule,
    formulaLatex: printFormulaLatex(rec.formula),
    formulaAscii: printFormula(rec.formula),
    stateFormulasLatex: printFormulaSetLatex(rec.stateFormulas),
  }));

  return {
    satisfiable: result.satisfiable,
    inputLatex,
    agents: allAgents,
    atoms: allAtoms,
    stats: {
      pretableauStates: result.pretableau.states.size,
      pretableauPrestates: result.pretableau.prestates.size,
      initialStates: result.initialTableau.states.size,
      initialEdges: result.initialTableau.edges.length,
      finalStates: result.finalTableau.states.size,
      finalEdges: result.finalTableau.edges.length,
      eliminationsE1: eliminations.filter((e) => e.rule === "E1").length,
      eliminationsE2: eliminations.filter((e) => e.rule === "E2").length,
    },
    eliminations,
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
  };
}
