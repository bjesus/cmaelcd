/**
 * Generate a standalone HTML file for visualizing tableau results.
 * Clean, light design aimed at logic students. Uses KaTeX for formula rendering.
 */

import { type TableauResult } from "../core/types.ts";
import { printFormula, printFormulaSet, printFormulaLatex } from "../core/printer.ts";
import { toDot } from "./text.ts";

export function generateHTML(result?: TableauResult): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CMAEL(CD) Tableau Solver</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>
<style>
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --surface-alt: #f5f5f5;
  --border: #e0e0e0;
  --text: #333333;
  --text-muted: #777777;
  --accent: #4a6fa5;
  --accent-light: #e8eef6;
  --sat: #2e7d32;
  --sat-bg: #e8f5e9;
  --unsat: #c62828;
  --unsat-bg: #ffebee;
  --highlight: #fff3e0;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg); color: var(--text);
  line-height: 1.6; padding: 0;
}
.header {
  background: var(--accent); color: white;
  padding: 24px 32px; text-align: center;
}
.header h1 { font-size: 1.4em; font-weight: 600; letter-spacing: 0.02em; }
.header p { font-size: 0.85em; opacity: 0.85; margin-top: 4px; }
.container { max-width: 860px; margin: 0 auto; padding: 24px 20px; }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px;
  margin-bottom: 20px; box-shadow: var(--shadow);
}
.card h2 {
  font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); margin-bottom: 16px; font-weight: 600;
}
label { display: block; font-size: 0.85em; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
input[type="text"] {
  width: 100%; padding: 10px 14px; border: 1.5px solid var(--border);
  border-radius: 6px; font-size: 15px; font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  background: var(--surface); color: var(--text); transition: border-color 0.15s;
}
input[type="text"]:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
input[type="text"]::placeholder { color: #bbb; }
.input-row { display: flex; gap: 12px; margin-bottom: 12px; }
.input-row > div { flex: 1; }
.input-row > div:first-child { flex: 2; }
.checkbox-label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.85em; color: var(--text-muted); cursor: pointer; user-select: none;
}
.checkbox-label input { accent-color: var(--accent); }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 24px; background: var(--accent); color: white; border: none;
  border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: 500;
  font-family: inherit; transition: background 0.15s;
}
.btn:hover { background: #3d5d8a; }
.btn:active { transform: translateY(1px); }
.actions { display: flex; align-items: center; gap: 16px; margin-top: 16px; }

/* Syntax reference */
.syntax-ref {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  font-size: 0.82em; color: var(--text-muted);
}
.syntax-ref code {
  background: var(--surface-alt); padding: 2px 6px; border-radius: 3px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.95em; color: var(--text);
}
.syntax-item { display: flex; align-items: baseline; gap: 6px; }
.syntax-item .katex { font-size: 0.95em; }

/* Examples */
.examples { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.example-btn {
  padding: 5px 12px; background: var(--accent-light); border: 1px solid var(--border);
  color: var(--accent); border-radius: 16px; cursor: pointer; font-size: 0.8em;
  font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.example-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* Result */
.result-banner {
  padding: 16px 20px; border-radius: var(--radius); margin-bottom: 16px;
  display: flex; align-items: center; gap: 12px; font-weight: 600;
}
.result-banner.sat { background: var(--sat-bg); color: var(--sat); border: 1px solid #c8e6c9; }
.result-banner.unsat { background: var(--unsat-bg); color: var(--unsat); border: 1px solid #ffcdd2; }
.result-banner .icon { font-size: 1.4em; }
.result-formula { margin-top: 4px; font-weight: 400; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.stat-box {
  background: var(--surface-alt); border-radius: 6px; padding: 12px; text-align: center;
}
.stat-box .num { font-size: 1.4em; font-weight: 700; color: var(--accent); }
.stat-box .label { font-size: 0.75em; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

/* Phase tabs */
.phase-tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
.phase-tab {
  padding: 8px 20px; background: none; border: none; color: var(--text-muted);
  cursor: pointer; font-family: inherit; font-size: 0.85em; font-weight: 500;
  border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s;
}
.phase-tab:hover { color: var(--text); }
.phase-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* State list */
.state-list { display: flex; flex-direction: column; gap: 8px; }
.state-item {
  padding: 10px 14px; background: var(--surface-alt); border-radius: 6px;
  border-left: 3px solid var(--border); font-size: 0.9em;
  overflow-x: auto;
}
.state-item.has-input { border-left-color: var(--accent); background: var(--highlight); }
.state-id { font-weight: 600; color: var(--accent); font-size: 0.8em; margin-bottom: 4px; }
.state-formulas .katex { font-size: 0.88em; }
.edge-item {
  padding: 8px 14px; background: var(--surface-alt); border-radius: 6px;
  font-size: 0.85em; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.edge-arrow { color: var(--text-muted); font-weight: 500; }
.edge-label { color: var(--accent); }

.empty-notice {
  padding: 24px; text-align: center; color: var(--text-muted);
  font-style: italic; font-size: 0.9em;
}

.section-label {
  font-size: 0.75em; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); font-weight: 600; margin: 16px 0 8px;
}

/* DOT output */
.dot-toggle {
  font-size: 0.8em; color: var(--accent); cursor: pointer; background: none;
  border: none; font-family: inherit; text-decoration: underline; margin-top: 12px;
}
.dot-box {
  margin-top: 8px; background: var(--surface-alt); border-radius: 6px; padding: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.75em; white-space: pre-wrap;
  max-height: 200px; overflow: auto; display: none;
}

#result-section { display: none; }

/* Loading */
.loading { display: none; color: var(--text-muted); font-style: italic; }

@media (max-width: 600px) {
  .input-row { flex-direction: column; }
  .stats-grid { grid-template-columns: 1fr; }
  .syntax-ref { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<div class="header">
  <h1>Epistemic Logic Tableau Solver</h1>
  <p>Satisfiability checker for CMAEL(CD) &mdash; multiagent epistemic logic with common and distributed knowledge</p>
</div>

<div class="container">

  <!-- Syntax Reference -->
  <div class="card">
    <h2>Syntax Reference</h2>
    <div class="syntax-ref">
      <div class="syntax-item"><code>p</code> &mdash; atomic proposition</div>
      <div class="syntax-item"><code>~p</code> &mdash; <span class="katex-placeholder" data-tex="\\neg p"></span></div>
      <div class="syntax-item"><code>(p & q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\wedge q)"></span></div>
      <div class="syntax-item"><code>(p | q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\vee q)"></span></div>
      <div class="syntax-item"><code>(p -> q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\to q)"></span></div>
      <div class="syntax-item"><code>Ka p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{K}_a\\, p"></span> (agent <em>a</em> knows <em>p</em>)</div>
      <div class="syntax-item"><code>D{a,b} p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{D}_{\\{a,b\\}}\\, p"></span> (distributed knowledge)</div>
      <div class="syntax-item"><code>C{a,b} p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{C}_{\\{a,b\\}}\\, p"></span> (common knowledge)</div>
    </div>

    <div class="examples">
      <button class="example-btn" onclick="setExample('(Ka p & ~Kb p)', '')">Ka p and not Kb p</button>
      <button class="example-btn" onclick="setExample('C{a,b} p', '')">Common knowledge</button>
      <button class="example-btn" onclick="setExample('(Ka p & ~p)', '')">Veridicality violation</button>
      <button class="example-btn" onclick="setExample('(~D{a,c} C{a,b} p & C{a,b} (p & q))', 'a,b,c')">Paper Ex. 3</button>
      <button class="example-btn" onclick="setExample('(~D{a,b} p & ~D{a,c} ~Ka p)', 'a,b,c')">Paper Ex. 4</button>
      <button class="example-btn" onclick="setExample('(C{a,b} Ka p -> ~C{b,c} Kb p)', 'a,b,c')">Paper Ex. 5</button>
    </div>
  </div>

  <!-- Input -->
  <div class="card">
    <h2>Input</h2>
    <div class="input-row">
      <div>
        <label for="formula-input">Formula</label>
        <input type="text" id="formula-input" placeholder="e.g.  (Ka p & ~Kb p)" autocomplete="off" spellcheck="false" />
      </div>
      <div>
        <label for="agents-input">Agents <span style="font-weight:400">(optional)</span></label>
        <input type="text" id="agents-input" placeholder="e.g. a,b,c" autocomplete="off" spellcheck="false" />
      </div>
    </div>
    <div class="actions">
      <button class="btn" id="solve-btn" onclick="solve()">Check Satisfiability</button>
      <label class="checkbox-label">
        <input type="checkbox" id="restricted-cuts" checked />
        Restricted cuts (C1/C2)
      </label>
      <span class="loading" id="loading">Solving...</span>
    </div>
    <div id="parse-error" style="color:var(--unsat);font-size:0.85em;margin-top:8px;display:none"></div>
  </div>

  <!-- Result -->
  <div id="result-section">

    <div id="result-banner" class="result-banner"></div>

    <div class="card">
      <h2>Tableau Statistics</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="num" id="stat-pre-states">-</div>
          <div class="label">Pretableau States</div>
        </div>
        <div class="stat-box">
          <div class="num" id="stat-init-states">-</div>
          <div class="label">Initial Tableau</div>
        </div>
        <div class="stat-box">
          <div class="num" id="stat-final-states">-</div>
          <div class="label">Final Tableau</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Tableau Details</h2>
      <div class="phase-tabs">
        <button class="phase-tab active" data-phase="final" onclick="showPhase('final', this)">Final Tableau</button>
        <button class="phase-tab" data-phase="initial" onclick="showPhase('initial', this)">Initial Tableau</button>
        <button class="phase-tab" data-phase="pretableau" onclick="showPhase('pretableau', this)">Pretableau</button>
      </div>
      <div id="phase-content"></div>
      <button class="dot-toggle" onclick="toggleDot()">Show DOT (Graphviz) output</button>
      <div id="dot-box" class="dot-box"></div>
    </div>
  </div>

</div>

<script>
let lastResult = null;
let currentPhase = 'final';

function setExample(formula, agents) {
  document.getElementById('formula-input').value = formula;
  document.getElementById('agents-input').value = agents;
  solve();
}

function renderLatex(container, tex) {
  try {
    katex.render(tex, container, { throwOnError: false, displayMode: false });
  } catch(e) {
    container.textContent = tex;
  }
}

// Render all placeholders on load
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.katex-placeholder').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });
  // Focus formula input
  document.getElementById('formula-input').focus();
});

// Enter key to solve
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement &&
      (document.activeElement.id === 'formula-input' || document.activeElement.id === 'agents-input')) {
    solve();
  }
});

function showPhase(phase, btn) {
  currentPhase = phase;
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (lastResult) displayPhase(lastResult, phase);
}

function displayPhase(result, phase) {
  const container = document.getElementById('phase-content');
  let html = '';

  let states, edges;
  if (phase === 'pretableau') {
    states = result.pretableau.states;
    edges = result.pretableau.solidEdges;
    const prestates = result.pretableau.prestates;

    html += '<div class="section-label">States (' + Object.keys(states).length + ')</div>';
    html += '<div class="state-list">';
    if (Object.keys(states).length === 0) {
      html += '<div class="empty-notice">No states were created (all expansions were inconsistent)</div>';
    }
    for (const [id, s] of Object.entries(states)) {
      html += '<div class="state-item' + (s.hasInput ? ' has-input' : '') + '">';
      html += '<div class="state-id">' + id + '</div>';
      html += '<div class="state-formulas" data-tex="' + escAttr(s.formulasLatex) + '"></div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="section-label">Prestates (' + Object.keys(prestates).length + ')</div>';
    html += '<div class="state-list">';
    for (const [id, s] of Object.entries(prestates)) {
      html += '<div class="state-item" style="border-left-color:#999;border-style:dashed">';
      html += '<div class="state-id">' + id + ' (prestate)</div>';
      html += '<div class="state-formulas" data-tex="' + escAttr(s.formulasLatex) + '"></div>';
      html += '</div>';
    }
    html += '</div>';
  } else {
    const tab = phase === 'initial' ? result.initialTableau : result.finalTableau;
    states = tab.states;
    edges = tab.edges;

    html += '<div class="section-label">States (' + Object.keys(states).length + ')</div>';
    html += '<div class="state-list">';
    if (Object.keys(states).length === 0) {
      html += '<div class="empty-notice">All states were eliminated &mdash; the formula is unsatisfiable</div>';
    }
    for (const [id, s] of Object.entries(states)) {
      html += '<div class="state-item' + (s.hasInput ? ' has-input' : '') + '">';
      html += '<div class="state-id">' + id + (s.hasInput ? ' (contains input formula)' : '') + '</div>';
      html += '<div class="state-formulas" data-tex="' + escAttr(s.formulasLatex) + '"></div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="section-label">Edges (' + edges.length + ')</div>';
    html += '<div class="state-list">';
    if (edges.length === 0 && Object.keys(states).length > 0) {
      html += '<div class="empty-notice">No transition edges</div>';
    } else if (edges.length === 0) {
      html += '<div class="empty-notice">No edges remain</div>';
    }
    for (const e of edges) {
      html += '<div class="edge-item">';
      html += '<span style="font-weight:600;color:var(--accent)">' + e.from + '</span>';
      html += '<span class="edge-arrow">&xrarr;</span>';
      html += '<span style="font-weight:600;color:var(--accent)">' + e.to + '</span>';
      html += '<span style="color:var(--text-muted);font-size:0.85em">via</span>';
      html += '<span class="edge-label" data-tex="' + escAttr(e.labelLatex) + '"></span>';
      html += '</div>';
    }
    html += '</div>';
  }

  container.innerHTML = html;

  // Render KaTeX in new elements
  container.querySelectorAll('[data-tex]').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });

  // Update DOT
  const dotBox = document.getElementById('dot-box');
  dotBox.textContent = result.dots[phase] || '';
}

function escAttr(s) {
  return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function toggleDot() {
  const box = document.getElementById('dot-box');
  box.style.display = box.style.display === 'none' || !box.style.display ? 'block' : 'none';
}

function solve() {
  const formula = document.getElementById('formula-input').value.trim();
  if (!formula) return;

  const agentsStr = document.getElementById('agents-input').value.trim();
  const restrictedCuts = document.getElementById('restricted-cuts').checked;
  const errorEl = document.getElementById('parse-error');
  errorEl.style.display = 'none';

  try {
    const result = solveFormula(formula, agentsStr, restrictedCuts);
    lastResult = result;

    const section = document.getElementById('result-section');
    section.style.display = 'block';

    const banner = document.getElementById('result-banner');
    if (result.satisfiable) {
      banner.className = 'result-banner sat';
      banner.innerHTML = '<span class="icon">&#10003;</span><div><div>Satisfiable</div>' +
        '<div class="result-formula" data-tex="' + escAttr(result.inputLatex) + '"></div></div>';
    } else {
      banner.className = 'result-banner unsat';
      banner.innerHTML = '<span class="icon">&#10007;</span><div><div>Unsatisfiable</div>' +
        '<div class="result-formula" data-tex="' + escAttr(result.inputLatex) + '"></div></div>';
    }
    banner.querySelectorAll('[data-tex]').forEach(function(el) {
      renderLatex(el, el.dataset.tex);
    });

    document.getElementById('stat-pre-states').textContent = result.stats.pretableauStates;
    document.getElementById('stat-init-states').textContent = result.stats.initialStates;
    document.getElementById('stat-final-states').textContent = result.stats.finalStates;

    // Reset to final tab
    document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.phase-tab[data-phase="final"]').classList.add('active');
    displayPhase(result, 'final');

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch(e) {
    errorEl.textContent = e.message;
    errorEl.style.display = 'block';
  }
}

// Placeholder solver — replaced by bundled code
function solveFormula(f, a, r) {
  throw new Error('Solver not loaded. Build with: bun run src/build-html.ts');
}
<\/script>
</body>
</html>`;
}
