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
<script src="https://cdn.jsdelivr.net/npm/@viz-js/viz@3.11.0/lib/viz-standalone.js"><\/script>
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
.header-credit {
  font-size: 0.78em; opacity: 0.7; margin-top: 10px; line-height: 1.5;
}
.header-credit a { color: white; text-decoration: underline; text-underline-offset: 2px; }
.header-credit a:hover { opacity: 1; }
.header-links {
  margin-top: 10px; display: flex; justify-content: center; gap: 16px;
}
.header-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.82em; color: white; opacity: 0.85; background: none;
  border: 1px solid rgba(255,255,255,0.3); border-radius: 16px;
  padding: 4px 14px; cursor: pointer; font-family: inherit;
  transition: all 0.15s; text-decoration: none;
}
.header-link:hover { opacity: 1; background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.5); }
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

/* View toggle */
.view-toggle { display: inline-flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; margin-left: auto; }
.view-toggle-btn {
  padding: 5px 14px; background: var(--surface); border: none; cursor: pointer;
  font-family: inherit; font-size: 0.8em; font-weight: 500; color: var(--text-muted);
  transition: all 0.15s; border-right: 1px solid var(--border);
}
.view-toggle-btn:last-child { border-right: none; }
.view-toggle-btn:hover { background: var(--surface-alt); }
.view-toggle-btn.active { background: var(--accent); color: white; }

/* Graph view */
.graph-container {
  overflow: auto; background: var(--surface-alt); border-radius: 6px;
  border: 1px solid var(--border); padding: 12px; margin-bottom: 12px;
  min-height: 100px; text-align: center; cursor: pointer; position: relative;
}
.graph-container svg { max-width: 100%; height: auto; }
.graph-loading { color: var(--text-muted); font-style: italic; font-size: 0.85em; padding: 24px; }
.graph-hint {
  position: absolute; bottom: 8px; right: 12px; font-size: 0.72em;
  color: var(--text-muted); opacity: 0.7; pointer-events: none;
}

/* Fullscreen overlay */
.graph-fullscreen {
  display: none; position: fixed; inset: 0; z-index: 9999;
  background: rgba(255,255,255,0.97); flex-direction: column;
}
.graph-fullscreen.open { display: flex; }
.graph-fs-toolbar {
  display: flex; align-items: center; gap: 12px; padding: 12px 20px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.graph-fs-toolbar .title { font-weight: 600; font-size: 0.9em; color: var(--text); }
.graph-fs-toolbar .hint { font-size: 0.78em; color: var(--text-muted); margin-left: auto; }
.graph-fs-close {
  padding: 6px 16px; background: var(--surface-alt); border: 1px solid var(--border);
  border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 0.82em;
  color: var(--text); transition: background 0.15s;
}
.graph-fs-close:hover { background: var(--border); }
.graph-fs-viewport {
  flex: 1; overflow: hidden; cursor: grab; position: relative;
}
.graph-fs-viewport:active { cursor: grabbing; }
.graph-fs-viewport svg {
  position: absolute; transform-origin: 0 0;
}

/* About modal */
.modal-backdrop {
  display: none; position: fixed; inset: 0; z-index: 8888;
  background: rgba(0,0,0,0.4); justify-content: center; align-items: flex-start;
  padding: 40px 20px; overflow-y: auto;
}
.modal-backdrop.open { display: flex; }
.modal {
  background: var(--surface); border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  max-width: 720px; width: 100%; padding: 32px; position: relative;
  animation: modalIn 0.2s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-close {
  position: absolute; top: 16px; right: 16px; background: var(--surface-alt);
  border: 1px solid var(--border); border-radius: 6px; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  font-size: 1.1em; color: var(--text-muted); transition: all 0.15s;
}
.modal-close:hover { background: var(--border); color: var(--text); }
.modal h2 { font-size: 1.15em; font-weight: 700; color: var(--text); margin-bottom: 20px; }
.about-section { margin-bottom: 24px; }
.about-section h3 { font-size: 0.95em; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.about-section p { font-size: 0.88em; color: var(--text); line-height: 1.7; }
.about-section .katex { font-size: 0.92em; }
.phase-explain { display: flex; flex-direction: column; gap: 14px; margin: 12px 0; }
.phase-step { display: flex; gap: 14px; align-items: flex-start; }
.phase-num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--accent); color: white; display: flex; align-items: center;
  justify-content: center; font-size: 0.8em; font-weight: 700; margin-top: 2px;
}
.phase-step div:last-child { font-size: 0.88em; line-height: 1.65; }
.about-table { width: 100%; border-collapse: collapse; font-size: 0.88em; margin-top: 8px; }
.about-table th {
  text-align: left; padding: 8px 12px; background: var(--surface-alt);
  border-bottom: 2px solid var(--border); font-weight: 600; font-size: 0.8em;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
}
.about-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
.about-table code {
  background: var(--surface-alt); padding: 2px 6px; border-radius: 3px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.95em;
}
.about-credits {
  padding: 12px 16px; background: var(--surface-alt); border-radius: 6px;
  border-left: 3px solid var(--accent);
}
.about-credits p { font-size: 0.85em; line-height: 1.7; }

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
  <div class="header-credit">
    Based on <a href="https://arxiv.org/abs/1201.5346" target="_blank" rel="noopener">Ajspur, Goranko &amp; Shkatov (2012)</a>
  </div>
  <div class="header-links">
    <button class="header-link" onclick="openAboutModal()">How it works</button>
  </div>
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

  <!-- About / How It Works Modal -->
  <div class="modal-backdrop" id="about-modal" onclick="if(event.target===this)closeAboutModal()">
    <div class="modal">
      <button class="modal-close" onclick="closeAboutModal()">&times;</button>
      <h2>How It Works</h2>

      <div class="about-section">
        <h3>What is this?</h3>
        <p>
          This tool checks whether a formula of <strong>CMAEL(CD)</strong> is <em>satisfiable</em>: that is,
          whether there exists a Kripke model and a state where the formula is true.
          CMAEL(CD) stands for <em>Complete Multiagent Epistemic Logic with Common and Distributed knowledge</em>.
          It extends standard multiagent epistemic logic with operators for <em>common knowledge</em>
          (<span class="katex-placeholder" data-tex="\\mathbf{C}_A \\varphi"></span> &mdash; every agent in coalition
          <span class="katex-placeholder" data-tex="A"></span> knows <span class="katex-placeholder" data-tex="\\varphi"></span>,
          and everyone knows that everyone knows it, ad infinitum) and <em>distributed knowledge</em>
          (<span class="katex-placeholder" data-tex="\\mathbf{D}_A \\varphi"></span> &mdash; <span class="katex-placeholder" data-tex="\\varphi"></span>
          follows from the combined knowledge of all agents in <span class="katex-placeholder" data-tex="A"></span>).
        </p>
      </div>

      <div class="about-section">
        <h3>The Algorithm</h3>
        <p>The algorithm is a <em>tableau-based decision procedure</em> that works in three phases:</p>
        <div class="phase-explain">
          <div class="phase-step">
            <div class="phase-num">1</div>
            <div>
              <strong>Construction (Pretableau)</strong><br>
              Starting from the input formula, the algorithm builds a graph of <em>prestates</em> and <em>states</em>.
              A prestate is a set of formulas waiting to be expanded. Each prestate is expanded into one or more
              <em>fully expanded, downward saturated</em> states by applying logical decomposition rules
              (splitting conjunctions, branching on disjunctions, and handling modal operators).
              For each diamond formula (<span class="katex-placeholder" data-tex="\\neg \\mathbf{D}_A \\varphi"></span>)
              in a state, a new prestate is created as a successor, ensuring the model has the required transitions.
              The process continues until no new prestates or states need to be created. This builds the <em>pretableau</em>.
            </div>
          </div>
          <div class="phase-step">
            <div class="phase-num">2</div>
            <div>
              <strong>Prestate Elimination</strong><br>
              Prestates served as intermediate construction artifacts. In this phase, every prestate is removed
              and edges are rewired: if state <em>s</em> pointed to prestate <em>p</em>, and <em>p</em> expanded
              to state <em>t</em>, then <em>s</em> now points directly to <em>t</em>.
              This produces the <em>initial tableau</em>: a graph consisting only of states and direct transition edges.
            </div>
          </div>
          <div class="phase-step">
            <div class="phase-num">3</div>
            <div>
              <strong>State Elimination</strong><br>
              The algorithm iteratively removes &ldquo;defective&rdquo; states. Two types of defects are checked in a dovetailed loop:
              <ul style="margin:8px 0 4px 20px">
                <li><strong>E1:</strong> If a state contains a diamond formula but has no matching successor, it is eliminated.</li>
                <li><strong>E2:</strong> <em>Eventualities</em> (arising from negated common knowledge formulas like
                  <span class="katex-placeholder" data-tex="\\neg \\mathbf{C}_A \\varphi"></span>) must be
                  <em>realized</em>: there must be a finite path of accessible states witnessing the eventuality.
                  States where an eventuality cannot be realized are eliminated.</li>
              </ul>
              This loop continues until no more states can be removed, yielding the <em>final tableau</em>.
            </div>
          </div>
        </div>
        <p style="margin-top:12px">
          The input formula is <strong>satisfiable</strong> if and only if the final tableau still contains a state
          that includes the input formula. The tool also supports <strong>restricted cut conditions (C1/C2)</strong>,
          an optimization from the paper that dramatically reduces the number of states explored (e.g., from 113 to 30 states
          in Example 5) without affecting correctness.
        </p>
      </div>

      <div class="about-section">
        <h3>Operators at a glance</h3>
        <table class="about-table">
          <tr><th>Operator</th><th>Syntax</th><th>Meaning</th></tr>
          <tr>
            <td><span class="katex-placeholder" data-tex="\\mathbf{K}_a \\varphi"></span></td>
            <td><code>Ka p</code></td>
            <td>Agent <em>a</em> knows <span class="katex-placeholder" data-tex="\\varphi"></span></td>
          </tr>
          <tr>
            <td><span class="katex-placeholder" data-tex="\\mathbf{D}_A \\varphi"></span></td>
            <td><code>D{a,b} p</code></td>
            <td>It is distributed knowledge among <span class="katex-placeholder" data-tex="A"></span> that <span class="katex-placeholder" data-tex="\\varphi"></span></td>
          </tr>
          <tr>
            <td><span class="katex-placeholder" data-tex="\\mathbf{C}_A \\varphi"></span></td>
            <td><code>C{a,b} p</code></td>
            <td>It is common knowledge among <span class="katex-placeholder" data-tex="A"></span> that <span class="katex-placeholder" data-tex="\\varphi"></span></td>
          </tr>
        </table>
        <p style="margin-top:8px;font-size:0.88em;color:var(--text-muted)">
          Note: <code>Ka p</code> is equivalent to <code>D{a} p</code> &mdash; individual knowledge is distributed knowledge for a singleton coalition.
        </p>
      </div>

      <div class="about-section about-credits">
        <h3>Reference</h3>
        <p>
          <strong>Tableau-based decision procedure for the multiagent epistemic logic with all coalitional operators
          for common and distributed knowledge</strong><br>
          Mai Ajspur, Valentin Goranko, and Dmitry Shkatov (2012)<br>
          <a href="https://arxiv.org/abs/1201.5346" target="_blank" rel="noopener" style="color:var(--accent)">arXiv:1201.5346v1</a>
        </p>
      </div>
    </div>
  </div>

  <!-- Fullscreen graph overlay -->
  <div class="graph-fullscreen" id="graph-fullscreen">
    <div class="graph-fs-toolbar">
      <span class="title" id="graph-fs-title">Tableau Graph</span>
      <span class="hint">Scroll to zoom &middot; Drag to pan &middot; Esc to close</span>
      <button class="graph-fs-close" onclick="closeFullscreen()">Close</button>
    </div>
    <div class="graph-fs-viewport" id="graph-fs-viewport"></div>
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
      <div style="display:flex;align-items:center;margin-bottom:16px">
        <h2 style="margin-bottom:0">Tableau Details</h2>
        <div class="view-toggle">
          <button class="view-toggle-btn active" id="view-list-btn" onclick="setView('list')">List</button>
          <button class="view-toggle-btn" id="view-graph-btn" onclick="setView('graph')">Graph</button>
        </div>
      </div>
      <div class="phase-tabs">
        <button class="phase-tab active" data-phase="final" onclick="showPhase('final', this)">Final Tableau</button>
        <button class="phase-tab" data-phase="initial" onclick="showPhase('initial', this)">Initial Tableau</button>
        <button class="phase-tab" data-phase="pretableau" onclick="showPhase('pretableau', this)">Pretableau</button>
      </div>
      <div id="graph-view" class="graph-container" style="display:none" onclick="openFullscreen()">
        <div class="graph-loading">Rendering graph...</div>
        <div class="graph-hint">Click to expand</div>
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
let currentView = 'list';
let vizInstance = null;
let vizLoading = false;

async function getViz() {
  if (vizInstance) return vizInstance;
  if (typeof Viz === 'undefined') {
    throw new Error('Viz.js not loaded');
  }
  if (vizLoading) {
    // Wait for existing load
    while (vizLoading) await new Promise(r => setTimeout(r, 50));
    return vizInstance;
  }
  vizLoading = true;
  try {
    vizInstance = await Viz.instance();
    return vizInstance;
  } finally {
    vizLoading = false;
  }
}

function setView(view) {
  currentView = view;
  document.getElementById('view-list-btn').classList.toggle('active', view === 'list');
  document.getElementById('view-graph-btn').classList.toggle('active', view === 'graph');
  document.getElementById('phase-content').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('graph-view').style.display = view === 'graph' ? 'block' : 'none';
  if (view === 'graph' && lastResult) {
    renderGraph(lastResult, currentPhase);
  }
}

async function renderGraph(result, phase) {
  const container = document.getElementById('graph-view');
  const dot = result.dots[phase];
  if (!dot) {
    container.innerHTML = '<div class="graph-loading">No graph data available</div>';
    return;
  }
  container.innerHTML = '<div class="graph-loading">Rendering graph...</div>';
  try {
    const viz = await getViz();
    const svg = viz.renderSVGElement(dot);
    container.innerHTML = '';
    container.appendChild(svg);
  } catch(e) {
    container.innerHTML = '<div class="graph-loading">Error rendering graph: ' + e.message + '</div>';
  }
}

// Fullscreen graph state
let fsScale = 1;
let fsPanX = 0;
let fsPanY = 0;
let fsDragging = false;
let fsDragStartX = 0;
let fsDragStartY = 0;
let fsPanStartX = 0;
let fsPanStartY = 0;

function openFullscreen() {
  if (!lastResult) return;
  const dot = lastResult.dots[currentPhase];
  if (!dot) return;

  const overlay = document.getElementById('graph-fullscreen');
  const viewport = document.getElementById('graph-fs-viewport');
  const phaseNames = { final: 'Final Tableau', initial: 'Initial Tableau', pretableau: 'Pretableau' };
  document.getElementById('graph-fs-title').textContent = phaseNames[currentPhase] || 'Graph';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Render SVG into fullscreen viewport
  getViz().then(function(viz) {
    const svg = viz.renderSVGElement(dot);
    viewport.innerHTML = '';
    viewport.appendChild(svg);

    // Reset transform
    fsScale = 1;
    fsPanX = 0;
    fsPanY = 0;

    // Center the SVG
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = svg.viewBox.baseVal.width || svg.getBBox().width;
    const sh = svg.viewBox.baseVal.height || svg.getBBox().height;

    // Remove fixed width/height so we control via transform
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = sw + 'px';
    svg.style.height = sh + 'px';

    // Fit to viewport
    const fitScale = Math.min(vw / sw, vh / sh, 1.5) * 0.9;
    fsScale = fitScale;
    fsPanX = (vw - sw * fsScale) / 2;
    fsPanY = (vh - sh * fsScale) / 2;
    applyFsTransform(svg);
  }).catch(function() {
    viewport.innerHTML = '<div style="padding:40px;color:#999">Failed to render graph</div>';
  });
}

function closeFullscreen() {
  const overlay = document.getElementById('graph-fullscreen');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('graph-fs-viewport').innerHTML = '';
}

function applyFsTransform(svg) {
  if (!svg) return;
  svg.style.transform = 'translate(' + fsPanX + 'px, ' + fsPanY + 'px) scale(' + fsScale + ')';
}

function getFsSvg() {
  return document.querySelector('#graph-fs-viewport svg');
}

// Wheel zoom
document.addEventListener('wheel', function(e) {
  const overlay = document.getElementById('graph-fullscreen');
  if (!overlay.classList.contains('open')) return;
  const viewport = document.getElementById('graph-fs-viewport');
  if (!viewport.contains(e.target) && e.target !== viewport) return;

  e.preventDefault();
  const svg = getFsSvg();
  if (!svg) return;

  const rect = viewport.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const oldScale = fsScale;
  const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  fsScale = Math.max(0.1, Math.min(10, fsScale * zoomFactor));

  // Zoom toward cursor position
  fsPanX = mx - (mx - fsPanX) * (fsScale / oldScale);
  fsPanY = my - (my - fsPanY) * (fsScale / oldScale);

  applyFsTransform(svg);
}, { passive: false });

// Mouse drag pan
document.addEventListener('mousedown', function(e) {
  const overlay = document.getElementById('graph-fullscreen');
  if (!overlay.classList.contains('open')) return;
  const viewport = document.getElementById('graph-fs-viewport');
  if (!viewport.contains(e.target) && e.target !== viewport) return;

  fsDragging = true;
  fsDragStartX = e.clientX;
  fsDragStartY = e.clientY;
  fsPanStartX = fsPanX;
  fsPanStartY = fsPanY;
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (!fsDragging) return;
  fsPanX = fsPanStartX + (e.clientX - fsDragStartX);
  fsPanY = fsPanStartY + (e.clientY - fsDragStartY);
  const svg = getFsSvg();
  if (svg) applyFsTransform(svg);
});

document.addEventListener('mouseup', function() {
  fsDragging = false;
});

// Esc to close overlays
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const graphOverlay = document.getElementById('graph-fullscreen');
    if (graphOverlay.classList.contains('open')) {
      closeFullscreen();
      e.preventDefault();
      return;
    }
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal.classList.contains('open')) {
      closeAboutModal();
      e.preventDefault();
    }
  }
});

let aboutRendered = false;
function openAboutModal() {
  const modal = document.getElementById('about-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Render KaTeX in the modal on first open
  if (!aboutRendered) {
    modal.querySelectorAll('.katex-placeholder').forEach(function(el) {
      if (el.dataset.tex) {
        renderLatex(el, el.dataset.tex);
        el.classList.remove('katex-placeholder');
      }
    });
    aboutRendered = true;
  }
}
function closeAboutModal() {
  const modal = document.getElementById('about-modal');
  modal.classList.remove('open');
  // Only restore scroll if fullscreen graph isn't also open
  if (!document.getElementById('graph-fullscreen').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

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
  if (lastResult) {
    displayPhase(lastResult, phase);
    if (currentView === 'graph') {
      renderGraph(lastResult, phase);
    }
  }
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
    currentPhase = 'final';
    document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.phase-tab[data-phase="final"]').classList.add('active');
    displayPhase(result, 'final');
    if (currentView === 'graph') {
      renderGraph(result, 'final');
    }

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
