import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/router.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
const enc = new TextEncoder();
const route = (s) => { const b = enc.encode(s); const p = ex.route_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.route(); };
let ok = true; const ck = (s, w) => { const g = route(s); if (g !== w) { console.error(`FAIL ${s}: ${g}!=${w}`); ok = false; } };
ck("POST /api/tts/voicevox", 4); ck("POST /api/tts", 5); ck("GET /api/health", 0); ck("POST /api/chat", 3); ck("GET /", -1);
console.log(ok ? "wasm OK — routing matches native" : "FAIL"); if (!ok) process.exit(1);
