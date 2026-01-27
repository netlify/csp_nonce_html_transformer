import { initSync as htmlRewriterInit } from "./csp_nonce_html_transformer.js";
import { gunzipSync } from "node:zlib";

let wasmGzipBase64: string | null = "__HTML_REWRITER_WASM_GZIP_BASE64__";

let initialized = false;

function decompress(compressedData: Uint8Array): Uint8Array {
  return gunzipSync(compressedData);
}

export function initHtmlRewriter(): void {
  if (initialized || !wasmGzipBase64) {
    return;
  }
  const compressed = base64Decode(wasmGzipBase64);
  const wasmBuffer = decompress(compressed);
  htmlRewriterInit(wasmBuffer);
  wasmGzipBase64 = null;
  initialized = true;
}

function base64Decode(b64: string): Uint8Array {
  const binaryString = atob(b64);
  const size = binaryString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
