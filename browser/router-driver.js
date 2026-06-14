// router-driver.js — Node サーバの dispatch グルー例。振り分けは Almide(wasm)、I/O は Node。
const NAMES = ["health","probe","convert","chat","tts_voicevox","tts","memory","settings","x"];
export async function loadRouter(wasmUrl) {
  const { readFile } = await import("node:fs/promises");
  const mod = await WebAssembly.compile(await readFile(new URL(wasmUrl, import.meta.url)));
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const enc = new TextEncoder();
  return {
    route(method, path) {
      const b = enc.encode(`${method} ${path}`);
      const p = ex.route_alloc(b.length);
      new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b);
      const id = ex.route();
      return id < 0 ? null : NAMES[id];
    },
  };
}
