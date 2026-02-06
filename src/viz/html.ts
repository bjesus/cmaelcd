/**
 * Generate a standalone HTML file for visualizing tableau results.
 * Uses inline SVG with a simple force-directed layout.
 */

import { type TableauResult } from "../core/types.ts";
import { printFormula, printFormulaSet } from "../core/printer.ts";
import { toDot } from "./text.ts";

/**
 * Generate a standalone HTML page for interactive tableau visualization.
 * Includes the solver inline so it can also accept new input.
 */
export function generateHTML(result?: TableauResult): string {
  const initialDot = result ? toDot(result, "final") : "";
  const initialSummary = result
    ? JSON.stringify({
        satisfiable: result.satisfiable,
        formula: printFormula(result.inputFormula),
        agents: result.agents,
        pretableauStates: result.pretableau.states.size,
        pretableauPrestates: result.pretableau.prestates.size,
        initialStates: result.initialTableau.states.size,
        initialEdges: result.initialTableau.edges.length,
        finalStates: result.finalTableau.states.size,
        finalEdges: result.finalTableau.edges.length,
      })
    : "null";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CMAEL(CD) Tableau Solver</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
  h1 { color: #e94560; margin-bottom: 20px; font-size: 1.5em; }
  .container { max-width: 1000px; margin: 0 auto; }
  .input-section { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
  .input-section label { display: block; margin-bottom: 8px; color: #a0a0a0; }
  .input-section input[type="text"] {
    width: 100%; padding: 10px; background: #0f3460; border: 1px solid #533483;
    color: #e0e0e0; font-family: 'Courier New', monospace; font-size: 14px;
    border-radius: 4px; margin-bottom: 10px;
  }
  .input-section input[type="text"]:focus { outline: none; border-color: #e94560; }
  .btn {
    padding: 8px 20px; background: #e94560; color: white; border: none;
    border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 14px;
    margin-right: 10px;
  }
  .btn:hover { background: #c73652; }
  .btn.secondary { background: #533483; }
  .btn.secondary:hover { background: #432a6b; }
  .result-section { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
  .result-sat { color: #4ecca3; font-weight: bold; font-size: 1.2em; }
  .result-unsat { color: #e94560; font-weight: bold; font-size: 1.2em; }
  .stats { color: #a0a0a0; margin-top: 10px; }
  .stats div { margin: 4px 0; }
  .phase-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
  .phase-tab {
    padding: 6px 16px; background: #0f3460; border: 1px solid #533483;
    color: #a0a0a0; cursor: pointer; border-radius: 4px 4px 0 0; font-family: inherit;
  }
  .phase-tab.active { background: #533483; color: #e0e0e0; }
  .graph-container {
    background: #0f3460; border-radius: 0 0 8px 8px; padding: 20px;
    min-height: 200px; overflow: auto;
  }
  pre { white-space: pre-wrap; word-break: break-all; font-size: 12px; }
  .help { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
  .help h3 { color: #e94560; margin-bottom: 10px; }
  .help code { background: #0f3460; padding: 2px 6px; border-radius: 3px; color: #4ecca3; }
  .examples { margin-top: 10px; }
  .examples button {
    display: block; width: 100%; text-align: left; padding: 6px 10px;
    background: #0f3460; border: 1px solid #533483; color: #a0a0a0;
    cursor: pointer; margin: 4px 0; border-radius: 4px; font-family: inherit;
  }
  .examples button:hover { background: #1a3a6e; color: #e0e0e0; }
  #dot-output { background: #0a0a1a; padding: 10px; border-radius: 4px; margin-top: 10px; }
  .states-list { margin-top: 10px; }
  .state-item {
    padding: 6px 10px; margin: 4px 0; background: #0a0a1a; border-radius: 4px;
    font-size: 11px; border-left: 3px solid #533483;
  }
  .state-item.has-input { border-left-color: #4ecca3; }
</style>
</head>
<body>
<div class="container">
  <h1>CMAEL(CD) Tableau Decision Procedure</h1>

  <div class="help">
    <h3>Syntax</h3>
    <div>
      Negation: <code>~p</code> |
      Conjunction: <code>(p & q)</code> |
      Disjunction: <code>(p | q)</code> |
      Implication: <code>(p -> q)</code>
    </div>
    <div style="margin-top:6px">
      Individual knowledge: <code>Ka p</code> |
      Distributed: <code>D{a,b} p</code> |
      Common: <code>C{a,b} p</code>
    </div>
    <div class="examples">
      <strong>Examples:</strong>
      <button onclick="setInput('(~D{a,c} C{a,b} p & C{a,b} (p & q))')">Ex 3: ~D{a,c} C{a,b} p & C{a,b} (p & q) [UNSAT]</button>
      <button onclick="setInput('(~D{a,b} p & ~D{a,c} ~Ka p)')">Ex 4: ~D{a,b} p & ~D{a,c} ~Ka p [UNSAT]</button>
      <button onclick="setInput('(C{a,b} Ka p -> ~C{b,c} Kb p)')">Ex 5: C{a,b} Ka p -> ~C{b,c} Kb p</button>
      <button onclick="setInput('(Ka p & ~Kb p)')">Ka p & ~Kb p [SAT]</button>
      <button onclick="setInput('C{a,b} p')">C{a,b} p [SAT]</button>
      <button onclick="setInput('(Ka p & ~p)')">Ka p & ~p [UNSAT - veridicality]</button>
    </div>
  </div>

  <div class="input-section">
    <label>Formula:</label>
    <input type="text" id="formula-input" placeholder="e.g. (Ka p & ~Kb p)" value="" />
    <label>Agents (optional, comma-separated):</label>
    <input type="text" id="agents-input" placeholder="e.g. a,b,c (leave empty to auto-detect)" value="" />
    <div>
      <label style="display:inline"><input type="checkbox" id="restricted-cuts" checked /> Use restricted cuts (C1/C2)</label>
    </div>
    <div style="margin-top:10px">
      <button class="btn" onclick="solve()">Solve</button>
    </div>
  </div>

  <div id="result-section" class="result-section" style="display:none">
    <div id="result-label"></div>
    <div id="result-stats" class="stats"></div>

    <div class="phase-tabs" style="margin-top:15px">
      <button class="phase-tab active" onclick="showPhase('final')">Final Tableau</button>
      <button class="phase-tab" onclick="showPhase('initial')">Initial Tableau</button>
      <button class="phase-tab" onclick="showPhase('pretableau')">Pretableau</button>
    </div>
    <div class="graph-container">
      <div id="states-display"></div>
      <div id="dot-output"><pre id="dot-content"></pre></div>
    </div>
  </div>
</div>

<script>
// The core solver is loaded inline (bundled)
// For now, we'll communicate with a simple postMessage or direct call
let lastResult = null;

function setInput(formula) {
  document.getElementById('formula-input').value = formula;
}

function showPhase(phase) {
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  if (lastResult) displayPhase(lastResult, phase);
}

function displayPhase(result, phase) {
  const statesDisplay = document.getElementById('states-display');
  const dotContent = document.getElementById('dot-content');

  let states, edges;
  if (phase === 'pretableau') {
    states = result.pretableau.states;
    edges = result.pretableau.solidEdges;
    let html = '<strong>States (' + Object.keys(states).length + '):</strong>';
    for (const [id, state] of Object.entries(states)) {
      const hasInput = state.hasInput;
      html += '<div class="state-item' + (hasInput ? ' has-input' : '') + '">' + id + ': ' + state.formulas + '</div>';
    }
    html += '<br><strong>Prestates (' + Object.keys(result.pretableau.prestates).length + '):</strong>';
    for (const [id, ps] of Object.entries(result.pretableau.prestates)) {
      html += '<div class="state-item">' + id + ': ' + ps.formulas + '</div>';
    }
    statesDisplay.innerHTML = html;
  } else {
    const tab = phase === 'initial' ? result.initialTableau : result.finalTableau;
    states = tab.states;
    edges = tab.edges;
    let html = '<strong>States (' + Object.keys(states).length + '):</strong>';
    if (Object.keys(states).length === 0) {
      html += '<div class="state-item">(empty - all states eliminated)</div>';
    }
    for (const [id, state] of Object.entries(states)) {
      const hasInput = state.hasInput;
      html += '<div class="state-item' + (hasInput ? ' has-input' : '') + '">' + id + ': ' + state.formulas + '</div>';
    }
    html += '<br><strong>Edges (' + Object.keys(edges).length + '):</strong>';
    for (const [idx, edge] of Object.entries(edges)) {
      html += '<div class="state-item">' + edge.from + ' --[' + edge.label + ']--> ' + edge.to + '</div>';
    }
    statesDisplay.innerHTML = html;
  }

  dotContent.textContent = result.dots[phase] || '';
}

async function solve() {
  const formula = document.getElementById('formula-input').value.trim();
  if (!formula) { alert('Please enter a formula'); return; }

  const agentsStr = document.getElementById('agents-input').value.trim();
  const restrictedCuts = document.getElementById('restricted-cuts').checked;

  try {
    const response = await solveFormula(formula, agentsStr, restrictedCuts);
    lastResult = response;

    const section = document.getElementById('result-section');
    section.style.display = 'block';

    const label = document.getElementById('result-label');
    if (response.satisfiable) {
      label.className = 'result-sat';
      label.textContent = 'SATISFIABLE';
    } else {
      label.className = 'result-unsat';
      label.textContent = 'UNSATISFIABLE';
    }

    const stats = document.getElementById('result-stats');
    stats.innerHTML =
      '<div>Pretableau: ' + response.stats.pretableauStates + ' states, ' + response.stats.pretableauPrestates + ' prestates</div>' +
      '<div>Initial tableau: ' + response.stats.initialStates + ' states, ' + response.stats.initialEdges + ' edges</div>' +
      '<div>Final tableau: ' + response.stats.finalStates + ' states, ' + response.stats.finalEdges + ' edges</div>';

    displayPhase(response, 'final');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

// This function will be replaced by the bundled solver
async function solveFormula(formula, agentsStr, restrictedCuts) {
  // Placeholder - will be replaced by actual solver code
  throw new Error('Solver not loaded. Please use the bundled version.');
}
</script>
</body>
</html>`;
}
