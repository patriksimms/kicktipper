#!/usr/bin/env bun

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("OK", { status: 200 });
  },
});

console.log(`✅ Server running on http://localhost:${server.port}`);
