/**
 * Build script: generates a standalone HTML file with the solver bundled inline.
 */

import { generateHTML } from "./viz/html.ts";

// Build the browser bundle as a string
const bundleResult = await Bun.build({
  entrypoints: ["./src/browser/index.ts"],
  target: "browser",
  minify: true,
});

if (!bundleResult.success) {
  console.error("Build failed:");
  for (const msg of bundleResult.logs) {
    console.error(msg);
  }
  process.exit(1);
}

const bundleCode = await bundleResult.outputs[0]!.text();

// Generate the base HTML
let html = generateHTML();

// Inject the bundled solver code before the closing </script> tag
// This replaces the placeholder solveFormula function
const solverScript = `
<script>
// Bundled CMAEL(CD) solver
${bundleCode}
</script>
`;

html = html.replace("</body>", solverScript + "\n</body>");

// Write to dist/
const fs = await import("fs");
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/index.html", html);

console.log("Built dist/index.html with inline solver (" + Math.round(bundleCode.length / 1024) + " KB)");
