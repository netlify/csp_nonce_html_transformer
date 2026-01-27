import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { gzip } from "node:zlib";

const gzipAsync = promisify(gzip);

async function generateHtmlRewriterWasmModule(wasmPath: string) {
  const wasmBuffer = await readFile(wasmPath);
  const compressed = await gzipAsync(wasmBuffer, { level: 9 });
  const wasmGzipBase64 = compressed.toString("base64");

  const templatePath = "./scripts/html-rewriter-wasm.template.ts";
  const template = await readFile(templatePath, "utf-8");
  const moduleContent = template.replace(
    "__HTML_REWRITER_WASM_GZIP_BASE64__",
    wasmGzipBase64,
  );

  await writeFile("./pkg/html-rewriter-wasm.ts", moduleContent);
}

async function main() {
  await Deno.remove("./pkg", { recursive: true });
  await Deno.run({
    cmd: ["wasm-pack", "build", "--target", "web", "--release"],
  }).status();
  await Deno.remove("./pkg/.gitignore");
  const pkg = await import("../pkg/package.json", {
    with: { type: "json" },
  });
  const wasmFile = pkg.default.files.find((name: string) =>
    name.endsWith(".wasm")
  );
  if (!wasmFile) {
    throw new Error("Could not find wasm file in package.json files");
  }
  await generateHtmlRewriterWasmModule(`./pkg/${wasmFile}`);
}

main();
