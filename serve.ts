const file = Bun.file("dist/index.html");
const html = await file.text();

Bun.serve({
  hostname: "0.0.0.0",
  port: 3000,
  fetch() {
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log("Serving on http://0.0.0.0:3000");
