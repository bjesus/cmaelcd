/**
 * Generate a standalone HTML file for visualizing tableau results.
 * Clean, light design aimed at logic students. Uses KaTeX for formula rendering.
 */

import { type TableauResult } from "../core/types.ts";
import {
  printFormula,
  printFormulaSet,
  printFormulaLatex,
} from "../core/printer.ts";
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
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"><\/script>
<style>
:root {
  --bg: #f4f5f7;
  --surface: #ffffff;
  --surface-alt: #f0f1f3;
  --border: #dfe1e6;
  --text: #2c3e50;
  --text-muted: #7a8599;
  --accent: #4a6fa5;
  --accent-light: #e8eef6;
  --sat: #2e7d32;
  --sat-bg: #e8f5e9;
  --unsat: #c62828;
  --unsat-bg: #ffebee;
  --highlight: #fff3e0;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.06);
  --left-width: 380px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg); color: var(--text);
  line-height: 1.6;
}

/* === Two-column layout === */
.app-layout {
  display: flex; height: 100vh; width: 100%;
}

/* --- Left panel --- */
.left-panel {
  width: var(--left-width); min-width: var(--left-width); max-width: var(--left-width);
  height: 100vh; display: flex; flex-direction: column;
  background: var(--surface); border-right: 1px solid var(--border);
  overflow: hidden; flex-shrink: 0;
}
.left-scroll {
  flex: 1; overflow-y: auto; padding: 24px 20px 20px;
}

/* Header area within left panel */
.app-header {
  padding: 24px 20px 16px; border-bottom: 1px solid var(--border);
  background: var(--accent); color: white;
}
.app-header h1 { font-size: 1.15em; font-weight: 700; letter-spacing: 0.01em; line-height: 1.3; }
.app-header .subtitle {
  font-size: 0.78em; opacity: 0.85; margin-top: 4px; line-height: 1.5;
}
.app-header .katex { color: white; font-size: 0.95em; }
.app-header .credit {
  font-size: 0.72em; opacity: 0.65; margin-top: 8px; line-height: 1.4;
}
.app-header .credit a { color: white; text-decoration: underline; text-underline-offset: 2px; }
.left-footer {
  padding: 8px 12px; border-top: 1px solid var(--border);
  display: flex; gap: 8px; flex-shrink: 0;
}
.footer-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center;
  padding: 6px 0; font-size: 0.76em; font-family: inherit; font-weight: 500;
  color: var(--accent); background: var(--accent-light); border: 1px solid var(--border);
  border-radius: 6px; cursor: pointer; text-decoration: none; transition: all 0.15s;
}
.footer-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* Sections in left panel */
.left-section {
  margin-bottom: 20px;
}
.left-section:last-child { margin-bottom: 0; }
.section-title {
  font-size: 0.72em; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); margin-bottom: 10px; font-weight: 700;
}

/* Formula input */
.formula-input-wrap { position: relative; }
input[type="text"] {
  width: 100%; padding: 10px 32px 10px 14px; border: 1.5px solid var(--border);
  border-radius: 6px; font-size: 14px; font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  background: var(--surface); color: var(--text); transition: border-color 0.15s;
}
input[type="text"]:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
input[type="text"]::placeholder { color: #bbb; }
.input-clear {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 22px; height: 22px; border: none; background: var(--surface-alt);
  border-radius: 50%; cursor: pointer; display: none; align-items: center;
  justify-content: center; font-size: 13px; color: var(--text-muted);
  line-height: 1; transition: all 0.15s;
}
.input-clear:hover { background: var(--border); color: var(--text); }
.formula-input-wrap.has-value .input-clear { display: flex; }

.actions { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: var(--accent); color: white; border: none;
  border-radius: 6px; cursor: pointer; font-size: 0.85em; font-weight: 600;
  font-family: inherit; transition: background 0.15s; white-space: nowrap;
}
.btn:hover { background: #3d5d8a; }
.btn:active { transform: translateY(1px); }
.checkbox-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.8em; color: var(--text-muted); cursor: pointer; user-select: none;
}
.checkbox-label input { accent-color: var(--accent); }
.loading { display: none; color: var(--text-muted); font-style: italic; font-size: 0.82em; }

/* Parse error */
.parse-error {
  color: var(--unsat); font-size: 0.82em; margin-top: 8px; display: none;
}

/* Syntax reference */
.syntax-ref {
  display: grid; grid-template-columns: 1fr; gap: 5px;
  font-size: 0.78em; color: var(--text-muted);
}
.syntax-ref code {
  background: var(--surface-alt); padding: 1px 5px; border-radius: 3px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.95em; color: var(--text);
}
.syntax-item { display: flex; align-items: baseline; gap: 6px; }
.syntax-item .katex { font-size: 0.9em; }

/* Examples */
.examples { display: flex; flex-wrap: wrap; gap: 5px; }
.example-btn {
  padding: 4px 10px; background: var(--accent-light); border: 1px solid var(--border);
  color: var(--accent); border-radius: 14px; cursor: pointer; font-size: 0.74em;
  font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.example-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* --- Right panel (results) --- */
.right-panel {
  flex: 1; height: 100vh; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
}
.right-scroll {
  flex: 1; overflow-y: auto; padding: 24px 28px;
}

/* Empty state for right panel */
.right-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: var(--text-muted); text-align: center; padding: 40px;
}
.right-empty .placeholder-icon {
  font-size: 3em; opacity: 0.25; margin-bottom: 16px;
}
.right-empty h2 { font-size: 1.1em; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
.right-empty p { font-size: 0.88em; max-width: 360px; line-height: 1.6; }

/* Cards in the right panel */
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px;
  margin-bottom: 16px; box-shadow: var(--shadow);
}
.card h2 {
  font-size: 0.78em; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); margin-bottom: 14px; font-weight: 600;
}

/* Result banner */
.result-banner {
  padding: 14px 18px; border-radius: var(--radius); margin-bottom: 16px;
  display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 0.95em;
}
.result-banner.sat { background: var(--sat-bg); color: var(--sat); border: 1px solid #c8e6c9; }
.result-banner.unsat { background: var(--unsat-bg); color: var(--unsat); border: 1px solid #ffcdd2; }
.result-banner .icon { font-size: 1.3em; }
.result-formula { margin-top: 4px; font-weight: 400; }
.result-banner .banner-stats {
  margin-left: auto; display: flex; gap: 14px; flex-shrink: 0;
}
.result-banner .banner-stat { text-align: center; line-height: 1.2; cursor: help; }
.result-banner .banner-stat .num { font-size: 1.1em; font-weight: 700; opacity: 0.7; }
.result-banner .banner-stat .label {
  font-size: 0.6em; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.04em; opacity: 0.6;
}

/* Phase tabs */
.phase-tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 14px; }
.phase-tab {
  padding: 7px 16px; background: none; border: none; color: var(--text-muted);
  cursor: pointer; font-family: inherit; font-size: 0.82em; font-weight: 500;
  border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s;
}
.phase-tab:hover { color: var(--text); }
.phase-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* State list */
.state-list { display: flex; flex-direction: column; gap: 7px; }
.state-item {
  padding: 9px 12px; background: var(--surface-alt); border-radius: 6px;
  border-left: 3px solid var(--border); font-size: 0.88em;
  overflow-x: auto;
}
.state-item.has-input { border-left-color: var(--accent); background: var(--highlight); }
.state-id { font-weight: 600; color: var(--accent); font-size: 0.78em; margin-bottom: 3px; }
.state-formulas .katex { font-size: 0.85em; }
.edge-item {
  padding: 7px 12px; background: var(--surface-alt); border-radius: 6px;
  font-size: 0.82em; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.edge-arrow { color: var(--text-muted); font-weight: 500; }
.edge-label { color: var(--accent); }

.empty-notice {
  padding: 20px; text-align: center; color: var(--text-muted);
  font-style: italic; font-size: 0.88em;
}

.section-label {
  font-size: 0.72em; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); font-weight: 600; margin: 14px 0 8px;
}

/* DOT output */
.dot-toggle {
  font-size: 0.78em; color: var(--accent); cursor: pointer; background: none;
  border: none; font-family: inherit; text-decoration: underline; margin-top: 10px;
}
.dot-box {
  margin-top: 8px; background: var(--surface-alt); border-radius: 6px; padding: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.72em; white-space: pre-wrap;
  max-height: 200px; overflow: auto; display: none;
}

/* View toggle */
.view-toggle { display: inline-flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; margin-left: auto; }
.view-toggle-btn {
  padding: 4px 12px; background: var(--surface); border: none; cursor: pointer;
  font-family: inherit; font-size: 0.78em; font-weight: 500; color: var(--text-muted);
  transition: all 0.15s; border-right: 1px solid var(--border);
}
.view-toggle-btn:last-child { border-right: none; }
.view-toggle-btn:hover { background: var(--surface-alt); }
.view-toggle-btn.active { background: var(--accent); color: white; }

/* Graph view */
.graph-container {
  overflow: hidden; background: var(--surface-alt); border-radius: 6px;
  border: 1px solid var(--border); margin-bottom: 12px;
  height: 500px; position: relative; /* Fixed height for interactive graph */
}
.graph-loading { 
  display: flex; align-items: center; justify-content: center; height: 100%;
  color: var(--text-muted); font-style: italic; font-size: 0.82em; 
}
.graph-hint {
  position: absolute; bottom: 8px; right: 12px; font-size: 0.7em;
  color: var(--text-muted); opacity: 0.7; pointer-events: none; z-index: 10;
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
  flex: 1; overflow: hidden; position: relative;
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

/* Graph options bar */
.graph-options {
  display: flex; gap: 14px; margin-bottom: 10px; flex-wrap: wrap; align-items: center;
}
.graph-options label {
  display: flex; align-items: center; gap: 5px; font-size: 0.78em;
  color: var(--text-muted); cursor: pointer; user-select: none;
}
.graph-options input[type="checkbox"] { cursor: pointer; }
.graph-options .download-btns { margin-left: auto; display: flex; gap: 6px; }
.graph-dl-btn {
  padding: 3px 10px; font-size: 0.72em; font-family: inherit; font-weight: 600;
  color: var(--accent); background: var(--accent-light); border: 1px solid var(--border);
  border-radius: 4px; cursor: pointer; transition: all 0.15s;
}
.graph-dl-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }

/* Elimination trace */
.elimination-card {
  background: var(--surface); border: 1px solid #e5a0a0;
  border-radius: 8px; padding: 18px; margin-bottom: 16px;
  border-left: 4px solid var(--unsat);
}
.elimination-card h3 { font-size: 0.92em; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.elimination-card .elim-summary {
  font-size: 0.82em; color: var(--text-muted); margin-bottom: 12px; line-height: 1.6;
}
.elim-list { display: flex; flex-direction: column; gap: 8px; }
.elim-item {
  display: flex; gap: 10px; align-items: flex-start; padding: 9px 11px;
  background: var(--surface-alt); border-radius: 6px; font-size: 0.82em;
}
.elim-badge {
  flex-shrink: 0; padding: 2px 7px; border-radius: 4px; font-size: 0.76em;
  font-weight: 600; letter-spacing: 0.03em;
}
.elim-badge.e1 { background: #fef3c7; color: #92400e; }
.elim-badge.e2 { background: #fee2e2; color: #991b1b; }
.elim-id { font-weight: 600; color: var(--text); min-width: 28px; }
.elim-reason { color: var(--text-muted); line-height: 1.5; }
.elim-reason .katex { font-size: 0.88em; }
.elim-formulas {
  margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border);
  color: var(--text-muted); font-size: 0.9em;
}

#result-section { display: none; }

/* Graph filters */
.graph-filters { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.filter-group { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; min-height: 24px; }
.filter-label { font-size: 0.72em; font-weight: 600; color: var(--text-muted); margin-right: 4px; text-transform: uppercase; min-width: 45px; }
.filter-chip {
  padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border);
  font-size: 0.76em; cursor: pointer; user-select: none; transition: all 0.15s;
  background: var(--surface); color: var(--text); display: flex; align-items: center; gap: 6px;
}
.filter-chip:hover { background: var(--surface-alt); border-color: var(--accent); }
.filter-chip.active { background: var(--accent); color: white; border-color: var(--accent); }
.filter-chip .color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.filter-chip.active .color-dot { box-shadow: 0 0 0 1px white; }

/* Dimming classes for D3 */
.d3-dimmed { opacity: 0.1 !important; transition: opacity 0.2s; }
.d3-highlight { opacity: 1 !important; stroke-width: 2px; }

/* Tooltip for D3 graph */
.d3-tooltip {
  position: absolute; pointer-events: none;
  background: white; border: 1px solid var(--border);
  border-radius: 6px; padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.82em; color: var(--text);
  max-width: 300px; z-index: 1000;
  display: none;
}
.d3-tooltip .title { font-weight: 600; border-bottom: 1px solid var(--border); padding-bottom: 4px; margin-bottom: 4px; }
.d3-tooltip .content { line-height: 1.4; }

/* === Responsive: single column on mobile === */
@media (max-width: 768px) {
  html, body { overflow: auto; height: auto; }
  .app-layout { flex-direction: column; height: auto; }
  .left-panel {
    width: 100%; min-width: 0; max-width: 100%;
    height: auto; border-right: none; border-bottom: 1px solid var(--border);
    overflow: visible;
  }
  .left-scroll { overflow: visible; }
  .right-panel { height: auto; overflow: visible; }
  .right-scroll { overflow: visible; padding: 16px; }
  .right-empty { display: none; }
  .result-banner { flex-wrap: wrap; }
  .result-banner .banner-stats { width: 100%; justify-content: space-around; margin-top: 8px; }
}
</style>
</head>
<body>

<div class="app-layout">

  <!-- ======= LEFT PANEL ======= -->
  <div class="left-panel">
    <div class="app-header">
      <h1>Epistemic Logic Tableau Solver</h1>
      <div class="subtitle">
        This tool checks whether a formula of <strong title="Complete Multiagent Epistemic Logic with Common and Distributed knowledge" style="cursor:help;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px">CMAEL(CD)</strong> is <em>satisfiable</em>: that is,
        whether there exists a Kripke model and a state where the formula is true.
        CMAEL(CD) extends standard multiagent epistemic logic with operators for <em>common knowledge</em>
        (<span class="katex-placeholder" data-tex="\\mathbf{C}_A \\varphi"></span> &mdash; every agent in coalition
        <span class="katex-placeholder" data-tex="A"></span> knows <span class="katex-placeholder" data-tex="\\varphi"></span>,
        and everyone knows that everyone knows it, ad infinitum) and <em>distributed knowledge</em>
        (<span class="katex-placeholder" data-tex="\\mathbf{D}_A \\varphi"></span> &mdash; <span class="katex-placeholder" data-tex="\\varphi"></span>
        follows from the combined knowledge of all agents in <span class="katex-placeholder" data-tex="A"></span>).
      </div>
      <div class="credit">
        Based on <a href="https://arxiv.org/abs/1201.5346" target="_blank" rel="noopener">Ajspur, Goranko &amp; Shkatov (2012)</a>
      </div>
    </div>

    <div class="left-scroll">

      <!-- Formula Input -->
      <div class="left-section">
        <div class="section-title">Formula</div>
        <div class="formula-input-wrap" id="formula-input-wrap">
          <input type="text" id="formula-input" placeholder="e.g.  (Ka p & ~Kb p)" autocomplete="off" spellcheck="false" />
          <button class="input-clear" id="input-clear" onclick="clearInput()" title="Clear">&times;</button>
        </div>
        <div class="actions">
          <button class="btn" id="solve-btn" onclick="solve()">Check Satisfiability</button>
          <label class="checkbox-label">
            <input type="checkbox" id="restricted-cuts" checked />
            Restricted cuts (C1/C2)
          </label>
          <span class="loading" id="loading">Solving...</span>
        </div>
        <div id="parse-error" class="parse-error"></div>
      </div>

      <!-- Examples -->
      <div class="left-section">
        <div class="section-title">Examples</div>
        <div class="examples">
          <button class="example-btn" onclick="setExample('(Ka p & ~Kb p)')">Ka p and not Kb p</button>
          <button class="example-btn" onclick="setExample('C{a,b} p')">Common knowledge</button>
          <button class="example-btn" onclick="setExample('(Ka p & ~p)')">Veridicality</button>
          <button class="example-btn" onclick="setExample('(~D{a,c} C{a,b} p & C{a,b} (p & q))')">Paper Ex. 3</button>
          <button class="example-btn" onclick="setExample('(~D{a,b} p & ~D{a,c} ~Ka p)')">Paper Ex. 4</button>
          <button class="example-btn" onclick="setExample('(C{a,b} Ka p -> ~C{b,c} Kb p)')">Paper Ex. 5</button>
        </div>
      </div>

      <!-- Syntax Reference -->
      <div class="left-section">
        <div class="section-title">Syntax Reference</div>
        <div class="syntax-ref">
          <div class="syntax-item"><code>p</code> &mdash; atomic proposition</div>
          <div class="syntax-item"><code>~p</code> &mdash; <span class="katex-placeholder" data-tex="\\neg p"></span></div>
          <div class="syntax-item"><code>(p & q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\wedge q)"></span></div>
          <div class="syntax-item"><code>(p | q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\vee q)"></span></div>
          <div class="syntax-item"><code>(p -> q)</code> &mdash; <span class="katex-placeholder" data-tex="(p \\to q)"></span></div>
          <div class="syntax-item"><code>Ka p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{K}_a\\, p"></span> (agent <em>a</em> knows <em>p</em>)</div>
          <div class="syntax-item"><code>K{a,b} p</code> &mdash; <span class="katex-placeholder" data-tex="(\\mathbf{K}_a\\, p \\wedge \\mathbf{K}_b\\, p)"></span> (a and b knows)</div>
          <div class="syntax-item"><code>D{a,b} p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{D}_{\\{a,b\\}}\\, p"></span> (distributed knowledge)</div>
          <div class="syntax-item"><code>C{a,b} p</code> &mdash; <span class="katex-placeholder" data-tex="\\mathbf{C}_{\\{a,b\\}}\\, p"></span> (common knowledge)</div>
        </div>
      </div>

    </div>
    <div class="left-footer">
      <button class="footer-btn" onclick="openAboutModal()">How it works</button>
      <a class="footer-btn" href="https://github.com/bjesus/cmaelcd" target="_blank" rel="noopener">Source code</a>
    </div>
  </div>

  <!-- ======= RIGHT PANEL ======= -->
  <div class="right-panel">
    <div class="right-scroll">

      <!-- Empty state placeholder -->
      <div class="right-empty" id="right-empty">
        <div class="placeholder-icon">&vellip;</div>
        <h2>Results will appear here</h2>
        <p>Enter a formula on the left and click <strong>Check Satisfiability</strong>, or try one of the examples.</p>
      </div>

      <!-- Result section (hidden until solve) -->
      <div id="result-section">

        <div id="result-banner" class="result-banner"></div>

        <div id="elimination-trace" style="display:none"></div>

        <div class="card">
          <div style="display:flex;align-items:center;margin-bottom:14px">
            <h2 style="margin-bottom:0">Tableau Details</h2>
            <div class="view-toggle">
              <button class="view-toggle-btn" id="view-list-btn" onclick="setView('list')">List</button>
              <button class="view-toggle-btn active" id="view-graph-btn" onclick="setView('graph')">Graph</button>
            </div>
          </div>
          <div class="phase-tabs">
            <button class="phase-tab active" data-phase="final" onclick="showPhase('final', this)">Final Tableau</button>
            <button class="phase-tab" data-phase="initial" onclick="showPhase('initial', this)">Initial Tableau</button>
            <button class="phase-tab" data-phase="pretableau" onclick="showPhase('pretableau', this)">Pretableau</button>
          </div>
          
          <div class="graph-filters" id="graph-filters" style="display:none">
            <div class="filter-group">
              <div class="filter-label">Agents</div>
              <div id="agent-filters" style="display:contents"></div>
            </div>
            <div class="filter-group">
              <div class="filter-label">Atoms</div>
              <div id="atom-filters" style="display:contents"></div>
            </div>
          </div>

          <div class="graph-options" id="graph-options" style="display:none">
            <label><input type="checkbox" id="opt-detailed" onchange="onGraphOptionChange()"> Detailed labels</label>
            <label id="opt-eliminated-label" style="display:none"><input type="checkbox" id="opt-eliminated" onchange="onGraphOptionChange()"> Show eliminated states</label>
            <span class="download-btns">
              <button class="graph-dl-btn" onclick="downloadSVG()">SVG</button>
              <button class="graph-dl-btn" onclick="downloadPNG()">PNG</button>
            </span>
          </div>
          <div id="graph-view" class="graph-container" onclick="openFullscreen()">
            <div class="graph-loading">Rendering graph...</div>
            <div class="graph-hint">Click to expand</div>
          </div>
          <div id="phase-content" style="display:none"></div>
          <button class="dot-toggle" onclick="toggleDot()">Show DOT (Graphviz) output</button>
          <div id="dot-box" class="dot-box"></div>
        </div>
      </div>

    </div>
  </div>

</div>

<!-- About / How It Works Modal -->
<div class="modal-backdrop" id="about-modal" onclick="if(event.target===this)closeAboutModal()">
  <div class="modal">
    <button class="modal-close" onclick="closeAboutModal()">&times;</button>
    <h2>How It Works</h2>

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
          <td><span class="katex-placeholder" data-tex="\\bigwedge_{a \\in A} \\mathbf{K}_a \\varphi"></span></td>
          <td><code>K{a,b} p</code></td>
          <td>Every agent in <span class="katex-placeholder" data-tex="A"></span> individually knows <span class="katex-placeholder" data-tex="\\varphi"></span></td>
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
        <code>K{a,b} p</code> is syntactic sugar for <code>(Ka p &amp; Kb p)</code>.
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

<script>
let lastResult = null;
let lastRawResult = null;
let currentPhase = 'final';
let currentView = 'graph';
let vizInstance = null;
let vizLoading = false;
let selectedAgents = new Set();
let selectedAtoms = new Set();

const COALITION_COLORS = [
  '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
  '#f4a582', '#a65628', '#f781bf', '#999999', '#000000'
];

function assignColorsToCoalitions(edges) {
  const map = new Map();
  const unique = new Set();
  edges.forEach(e => {
    if (e.coalition) unique.add(e.coalition.join(','));
  });
  
  const sorted = Array.from(unique).sort((a, b) => {
    const al = a.split(',').length;
    const bl = b.split(',').length;
    if (al !== bl) return al - bl;
    return a.localeCompare(b);
  });

  sorted.forEach((key, i) => {
    const color = i < COALITION_COLORS.length 
      ? COALITION_COLORS[i] 
      : 'hsl(' + ((i * 360) / sorted.length) + ', 70%, 50%)';
    map.set(key, color);
  });
  return map;
}

function solve() {
  const formula = document.getElementById('formula-input').value.trim();
  if (!formula) return;

  const restrictedCuts = document.getElementById('restricted-cuts').checked;
  const errorEl = document.getElementById('parse-error');
  errorEl.style.display = 'none';

  try {
    lastRawResult = solveFormula(formula, '', restrictedCuts);
    lastResult = serializeResult(lastRawResult);
    
    selectedAgents.clear();
    selectedAtoms.clear();

    const section = document.getElementById('result-section');
    section.style.display = 'block';
    var empty = document.getElementById('right-empty');
    if (empty) empty.style.display = 'none';

    renderBanner(lastResult);
    renderEliminationTrace(lastResult);

    document.getElementById('opt-detailed').checked = false;
    document.getElementById('opt-eliminated').checked = false;
    updateGraphOptionsVisibility();

    showPhase('final', document.querySelector('.phase-tab[data-phase="final"]'));

  } catch (e) {
    console.error(e);
    errorEl.textContent = e.message;
    errorEl.style.display = 'block';
  }
}

function renderBanner(result) {
  const banner = document.getElementById('result-banner');
  var pretableauNodes = result.stats.pretableauStates + result.stats.pretableauPrestates;
  var statsHtml = '<div class="banner-stats">' +
    '<div class="banner-stat" title="Phase 1 (Construction)"><div class="num">' + pretableauNodes + '</div><div class="label">Pretableau</div></div>' +
    '<div class="banner-stat" title="Phase 2 (Prestate Elimination)"><div class="num">' + result.stats.initialStates + '</div><div class="label">Initial</div></div>' +
    '<div class="banner-stat" title="Phase 3 (State Elimination)"><div class="num">' + result.stats.finalStates + '</div><div class="label">Final</div></div>' +
    '</div>';
  
  if (result.satisfiable) {
    banner.className = 'result-banner sat';
    banner.innerHTML = '<span class="icon">&#10003;</span><div><div>Satisfiable</div>' +
      '<div class="result-formula" data-tex="' + escAttr(result.inputLatex) + '"></div></div>' + statsHtml;
  } else {
    banner.className = 'result-banner unsat';
    banner.innerHTML = '<span class="icon">&#10007;</span><div><div>Unsatisfiable</div>' +
      '<div class="result-formula" data-tex="' + escAttr(result.inputLatex) + '"></div></div>' + statsHtml;
  }
  banner.querySelectorAll('[data-tex]').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });
}

function onGraphOptionChange() {
  if (currentView === 'graph' && lastResult) {
    renderGraph();
  }
}

function updateGraphOptionsVisibility() {
  const isGraph = currentView === 'graph';
  document.getElementById('graph-options').style.display = isGraph ? 'flex' : 'none';
  document.getElementById('graph-filters').style.display = isGraph ? 'flex' : 'none';
  var showElimLabel = document.getElementById('opt-eliminated-label');
  var hasElims = lastResult && lastResult.eliminations && lastResult.eliminations.length > 0;
  showElimLabel.style.display = (currentPhase === 'final' && hasElims) ? '' : 'none';
}

async function getViz() {
  if (vizInstance) return vizInstance;
  vizInstance = await Viz.instance();
  return vizInstance;
}

function setView(view) {
  currentView = view;
  document.getElementById('view-list-btn').classList.toggle('active', view === 'list');
  document.getElementById('view-graph-btn').classList.toggle('active', view === 'graph');
  document.getElementById('phase-content').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('graph-view').style.display = view === 'graph' ? 'block' : 'none';
  updateGraphOptionsVisibility();
  if (view === 'graph' && lastResult) {
    renderGraph();
  }
}

function showPhase(phase, btn) {
  currentPhase = phase;
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateGraphOptionsVisibility();
  if (lastResult) {
    displayPhase(lastResult, phase);
    if (currentView === 'graph') {
      renderGraph();
    }
  }
}

function displayPhase(result, phase) {
  const container = document.getElementById('phase-content');
  let html = '';
  let states, edges;
  const data = getPhaseData(result, phase);
  states = data.states;
  edges = data.edges;
  const prestates = data.prestates || {};

  html += '<div class="section-label">States (' + Object.keys(states).length + ')</div>';
  html += '<div class="state-list">';
  if (Object.keys(states).length === 0) {
    html += '<div class="empty-notice">No states</div>';
  }
  for (const [id, s] of Object.entries(states)) {
    html += '<div class="state-item' + (s.hasInput ? ' has-input' : '') + '">';
    html += '<div class="state-id">' + id + '</div>';
    html += '<div class="state-formulas" data-tex="' + escAttr(s.formulasLatex) + '"></div>';
    html += '</div>';
  }
  html += '</div>';

  if (Object.keys(prestates).length > 0) {
    html += '<div class="section-label">Prestates (' + Object.keys(prestates).length + ')</div>';
    html += '<div class="state-list">';
    for (const [id, s] of Object.entries(prestates)) {
      html += '<div class="state-item" style="border-left-color:#999;border-style:dashed">';
      html += '<div class="state-id">' + id + ' (prestate)</div>';
      html += '<div class="state-formulas" data-tex="' + escAttr(s.formulasLatex) + '"></div>';
      html += '</div>';
    }
    html += '</div>';
  }

  html += '<div class="section-label">Edges (' + edges.length + ')</div>';
  html += '<div class="state-list">';
  if (edges.length === 0) html += '<div class="empty-notice">No edges</div>';
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

  container.innerHTML = html;
  container.querySelectorAll('[data-tex]').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });
  
  updateDotBox();
}

function getPhaseData(result, phase) {
  if (phase === 'pretableau') return { 
    states: result.pretableau.states, 
    prestates: result.pretableau.prestates,
    edges: result.pretableau.solidEdges 
  };
  if (phase === 'initial') return result.initialTableau;
  return result.finalTableau;
}

function parseSpline(posStr) {
  if (!posStr) return null;
  const parts = posStr.split(' ');
  const points = [];
  for (const p of parts) {
    if (p.startsWith('e,') || p.startsWith('s,')) continue; // ignore start/end for path
    const [x, y] = p.split(',');
    points.push({x: +x, y: -y});
  }
  return points;
}

function generateSplinePath(points) {
  if (!points || !points.length) return '';
  let path = 'M ' + points[0].x + ' ' + points[0].y;
  for (let i = 1; i < points.length; i += 3) {
    if (i + 2 < points.length) {
      path += ' C ' + points[i].x + ' ' + points[i].y + ', ' + 
              points[i+1].x + ' ' + points[i+1].y + ', ' + 
              points[i+2].x + ' ' + points[i+2].y;
    }
  }
  return path;
}

async function renderGraph() {
  const container = document.getElementById('graph-view');
  container.innerHTML = '<div class="graph-loading">Computing layout...</div>';
  
  populateFilters(); // Update filters

  try {
    const viz = await getViz();
    const showElim = document.getElementById('opt-eliminated').checked;
    
    const dot = generateDot(lastRawResult, currentPhase, { 
      layoutOnly: true, 
      showEliminated: showElim 
    });
    
    const json = await viz.renderJSON(dot);
    drawD3Graph(json, container);
    updateDotBox();
    
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="graph-loading">Error: ' + e.message + '</div>';
  }
}

function drawD3Graph(layout, container) {
  container.innerHTML = '';
  
  // D3 Tooltip
  let tooltip = d3.select('body').select('.d3-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div').attr('class', 'd3-tooltip');
  }

  const data = getPhaseData(lastResult, currentPhase);
  const colorMap = assignColorsToCoalitions(data.edges);
  
  // Filter objects
  const objects = (layout.objects || []).filter(o => o.name !== 'cluster' && o.name !== 'graph' && o.pos);
  const edges = (layout.edges || []).filter(e => e.pos);
  
  if (objects.length === 0) {
    container.innerHTML = '<div class="graph-loading">No states to display</div>';
    return;
  }

  // Parse nodes
  const nodes = objects.map(o => {
    const [x, y] = o.pos.split(',');
    const id = o.name;
    const stateData = data.states[id] || (data.prestates ? data.prestates[id] : null);
    // Graphviz uses inches, 72pts/inch
    return {
      id,
      x: +x,
      y: -y,
      width: (+o.width || 0.75) * 72,
      height: (+o.height || 0.5) * 72,
      data: stateData,
      isPrestate: !!(data.prestates && data.prestates[id]),
      isEliminated: !stateData && currentPhase === 'final' // heuristic
    };
  });
  
  const nodesMap = new Map(nodes.map(n => [n.id, n]));
  
  // Parse edges
  const links = edges.map(e => {
    const sourceId = objects[e.tail].name;
    const targetId = objects[e.head].name;
    const points = parseSpline(e.pos);
    
    // Find matching edge data
    // Warning: this simple matching assumes only one edge type between nodes or generic label matching
    // For now, we take the first matching edge in data
    const edgeData = data.edges.find(ed => ed.from === sourceId && ed.to === targetId);
    
    return {
      source: nodesMap.get(sourceId),
      target: nodesMap.get(targetId),
      points,
      data: edgeData,
      color: edgeData ? colorMap.get(edgeData.coalition ? edgeData.coalition.join(',') : '') || '#999' : '#999'
    };
  }).filter(l => l.source && l.target);

  // Setup SVG
  const width = container.clientWidth;
  const height = 500;
  
  const svg = d3.select(container).append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height]);
    
  const g = svg.append('g');
  
  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.1, 8])
    .on('zoom', e => g.attr('transform', e.transform));
    
  svg.call(zoom);
  
  // Initial center
  if (nodes.length > 0) {
    const bounds = {
      minX: Math.min(...nodes.map(n => n.x - n.width/2)),
      maxX: Math.max(...nodes.map(n => n.x + n.width/2)),
      minY: Math.min(...nodes.map(n => n.y - n.height/2)),
      maxY: Math.max(...nodes.map(n => n.y + n.height/2)),
    };
    const gw = bounds.maxX - bounds.minX + 100;
    const gh = bounds.maxY - bounds.minY + 100;
    const scale = Math.min(width/gw, height/gh, 1.2);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(width/2, height/2)
      .scale(scale)
      .translate(-cx, -cy));
  }

  // Arrowheads
  const defs = svg.append('defs');
  colorMap.forEach((color, key) => {
    const id = 'arrow-' + key.replace(/[^a-z0-9]/gi, '_');
    defs.append('marker')
      .attr('id', id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', color);
  });
  // Default arrow
  defs.append('marker')
    .attr('id', 'arrow-default')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999');

  // Draw edges
  g.selectAll('.edge')
    .data(links)
    .enter().append('path')
    .attr('class', 'edge')
    .attr('d', d => generateSplinePath(d.points))
    .attr('fill', 'none')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 1.5)
    .attr('marker-end', d => {
      if (!d.data || !d.data.coalition) return 'url(#arrow-default)';
      return 'url(#arrow-' + d.data.coalition.join(',').replace(/[^a-z0-9]/gi, '_') + ')';
    });

  // Draw nodes
  const nodeGroups = g.selectAll('.node')
    .data(nodes)
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
    .style('cursor', 'pointer');

  // Node shape
  nodeGroups.append('rect')
    .attr('x', d => -d.width/2)
    .attr('y', d => -d.height/2)
    .attr('width', d => d.width)
    .attr('height', d => d.height)
    .attr('rx', d => d.isPrestate ? d.width : 4) // Ellipse-ish for prestates
    .attr('ry', d => d.isPrestate ? d.height : 4)
    .attr('fill', d => {
      if (d.isEliminated) return '#fee2e2';
      if (d.data && d.data.hasInput) return '#dcfce7';
      return '#f8f9fa';
    })
    .attr('stroke', d => {
      if (d.isEliminated) return '#e5a0a0';
      if (d.data && d.data.hasInput) return '#86d997';
      return '#d0d0d0';
    })
    .attr('stroke-width', d => (d.data && d.data.hasInput) ? 2 : 1)
    .style('stroke-dasharray', d => (d.isPrestate || d.isEliminated) ? '4 2' : 'none');

  // Node label (State ID)
  nodeGroups.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.4em')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('fill', '#444')
    .text(d => d.id);

  // Valuation label (p, ¬q)
  nodeGroups.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.8em')
    .attr('font-size', '9px')
    .attr('fill', '#666')
    .text(d => {
      if (!d.data || !d.data.atoms) return '';
      const parts = d.data.atoms.map(a => a.value ? a.name : '¬' + a.name);
      if (parts.length === 0) return '';
      if (parts.length > 3) return parts.slice(0, 3).join(',') + '...';
      return parts.join(', ');
    });

  // Hover events
  nodeGroups.on('mouseenter', (e, d) => {
    if (!d.data || !d.data.formulaListLatex) return;
    
    // Show tooltip
    tooltip.style('display', 'block')
      .style('left', (e.pageX + 15) + 'px')
      .style('top', (e.pageY + 15) + 'px')
      .html('<div class="title">' + d.id + '</div>' + 
            '<div class="content">' + 
            d.data.formulaListLatex.map(f => '<div><span data-tex="' + escAttr(f) + '"></span></div>').join('') + 
            '</div>');
            
    tooltip.selectAll('[data-tex]').each(function() {
      renderLatex(this, this.dataset.tex);
    });
  })
  .on('mousemove', (e) => {
    tooltip.style('left', (e.pageX + 15) + 'px')
      .style('top', (e.pageY + 15) + 'px');
  })
  .on('mouseleave', () => {
    tooltip.style('display', 'none');
  });
  
  updateHighlights();
}

function populateFilters() {
  if (!lastResult) return;
  
  const agentsDiv = document.getElementById('agent-filters');
  const atomsDiv = document.getElementById('atom-filters');
  agentsDiv.innerHTML = '';
  atomsDiv.innerHTML = '';
  
  lastResult.agents.forEach((a, i) => {
    const el = document.createElement('div');
    el.className = 'filter-chip';
    if (selectedAgents.has(a)) el.classList.add('active');
    
    // Simple color cycle matching COALITION_COLORS for singletons (approx)
    const color = COALITION_COLORS[i % COALITION_COLORS.length];
    
    el.innerHTML = '<div class="color-dot" style="background:'+color+'"></div>' + a;
    el.onclick = () => {
      if (selectedAgents.has(a)) selectedAgents.delete(a);
      else selectedAgents.add(a);
      populateFilters();
      updateHighlights();
    };
    agentsDiv.appendChild(el);
  });
  
  lastResult.atoms.forEach(p => {
    const el = document.createElement('div');
    el.className = 'filter-chip';
    if (selectedAtoms.has(p)) el.classList.add('active');
    el.textContent = p;
    el.onclick = () => {
      if (selectedAtoms.has(p)) selectedAtoms.delete(p);
      else selectedAtoms.add(p);
      populateFilters();
      updateHighlights();
    };
    atomsDiv.appendChild(el);
  });
}

function updateHighlights() {
  const svg = d3.select('#graph-view svg');
  if (svg.empty()) return;
  
  const nodes = svg.selectAll('.node');
  const edges = svg.selectAll('.edge');
  
  if (selectedAgents.size === 0 && selectedAtoms.size === 0) {
    nodes.classed('d3-dimmed', false);
    edges.classed('d3-dimmed', false);
    return;
  }
  
  edges.classed('d3-dimmed', d => {
    if (selectedAgents.size === 0) return false;
    if (!d.data || !d.data.coalition) return true;
    return !d.data.coalition.some(a => selectedAgents.has(a));
  });
  
  nodes.classed('d3-dimmed', d => {
    let atomMatch = true;
    if (selectedAtoms.size > 0) {
      if (!d.data || !d.data.atoms) atomMatch = false;
      else {
        atomMatch = Array.from(selectedAtoms).every(atom => 
          d.data.atoms.some(a => a.name === atom && a.value === true)
        );
      }
    }
    return !atomMatch;
  });
}

function updateDotBox() {
  const box = document.getElementById('dot-box');
  if (box.style.display !== 'none') {
    const detailed = document.getElementById('opt-detailed').checked;
    const showElim = document.getElementById('opt-eliminated').checked;
    box.textContent = generateDot(lastRawResult, currentPhase, {
      detailedLabels: detailed,
      showEliminated: showElim
    });
  }
}

function toggleDot() {
  const box = document.getElementById('dot-box');
  box.style.display = box.style.display === 'none' || !box.style.display ? 'block' : 'none';
  updateDotBox();
}

function renderEliminationTrace(result) {
  const container = document.getElementById('elimination-trace');
  if (result.satisfiable) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  var html = '<div class="elimination-card">';
  html += '<h3>Why is this unsatisfiable?</h3>';
  if (result.stats.pretableauStates === 0) {
    html += '<div class="elim-summary">All formula expansions led to <strong>contradictions</strong>.</div>';
  } else if (result.eliminations.length === 0) {
    html += '<div class="elim-summary">All ' + result.stats.initialStates + ' states from the initial tableau were eliminated.</div>';
  } else {
    var e1Count = result.stats.eliminationsE1 || 0;
    var e2Count = result.stats.eliminationsE2 || 0;
    html += '<div class="elim-summary">All ' + result.stats.initialStates + ' states were eliminated:';
    if (e1Count > 0) html += '<br><strong>' + e1Count + '</strong> by rule <strong>E1</strong> (diamond formula had no valid successor)';
    if (e2Count > 0) html += '<br><strong>' + e2Count + '</strong> by rule <strong>E2</strong> (eventuality could not be realized)';
    html += '</div><div class="elim-list">';
    for (var i = 0; i < result.eliminations.length; i++) {
      var e = result.eliminations[i];
      html += '<div class="elim-item"><span class="elim-badge ' + e.rule.toLowerCase() + '">' + e.rule + '</span>';
      html += '<span class="elim-id">' + e.stateId + '</span><div class="elim-reason">';
      if (e.rule === 'E1') {
        html += 'Diamond formula <span data-tex="' + escAttr(e.formulaLatex) + '"></span> had no surviving successor state';
      } else {
        html += 'Eventuality <span data-tex="' + escAttr(e.formulaLatex) + '"></span> could not be realized';
      }
      html += '<div class="elim-formulas">State contained: <span data-tex="' + escAttr(e.stateFormulasLatex) + '"></span></div></div></div>';
    }
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
  container.style.display = 'block';
  container.querySelectorAll('[data-tex]').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });
}

function escAttr(s) {
  return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function setExample(formula) {
  document.getElementById('formula-input').value = formula;
  updateClearBtn();
  solve();
}

function clearInput() {
  var input = document.getElementById('formula-input');
  input.value = '';
  updateClearBtn();
  input.focus();
  document.getElementById('parse-error').style.display = 'none';
}

function updateClearBtn() {
  var wrap = document.getElementById('formula-input-wrap');
  var input = document.getElementById('formula-input');
  wrap.classList.toggle('has-value', input.value.length > 0);
}

function renderLatex(container, tex) {
  try {
    katex.render(tex, container, { throwOnError: false, displayMode: false });
  } catch(e) {
    container.textContent = tex;
  }
}

let aboutRendered = false;
function openAboutModal() {
  const modal = document.getElementById('about-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
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
  if (!document.getElementById('graph-fullscreen').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

// Global Fullscreen helpers
function openFullscreen() {
  if (!lastResult) return;
  const overlay = document.getElementById('graph-fullscreen');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderGraph('graph-fs-viewport');
}

function closeFullscreen() {
  const overlay = document.getElementById('graph-fullscreen');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  // Redraw in small view
  renderGraph('graph-view');
}

// Overwrite renderGraph to handle target
renderGraph = async function(targetId) {
  const container = document.getElementById(targetId || 'graph-view');
  container.innerHTML = '<div class="graph-loading">Computing layout...</div>';
  try {
    const viz = await getViz();
    const showElim = document.getElementById('opt-eliminated').checked;
    const dot = generateDot(lastRawResult, currentPhase, { 
      layoutOnly: true, 
      showEliminated: showElim 
    });
    const json = await viz.renderJSON(dot);
    drawD3Graph(json, container);
    updateDotBox();
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="graph-loading">Error: ' + e.message + '</div>';
  }
}

// Download handlers
async function downloadSVG() {
  const svg = document.querySelector('#graph-view svg');
  if (!svg) return;
  // clone and add background
  const clone = svg.cloneNode(true);
  clone.setAttribute('style', 'background: white');
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tableau.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadPNG() {
  const svg = document.querySelector('#graph-view svg');
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = svg.clientWidth * 2;
    canvas.height = svg.clientHeight * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(function(pngBlob) {
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'tableau.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.katex-placeholder').forEach(function(el) {
    renderLatex(el, el.dataset.tex);
  });
  var input = document.getElementById('formula-input');
  input.focus();
  input.addEventListener('input', updateClearBtn);
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'formula-input') {
    solve();
  }
  if (e.key === 'Escape') {
    if (document.getElementById('graph-fullscreen').classList.contains('open')) closeFullscreen();
    else if (document.getElementById('about-modal').classList.contains('open')) closeAboutModal();
  }
});

</script>
</body>
</html>`;
}
