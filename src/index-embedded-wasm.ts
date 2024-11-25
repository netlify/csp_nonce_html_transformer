import { default as init } from "../pkg/csp_nonce_html_transformer.js";
import { wasmBinary } from "../pkg/embedded-wasm.ts";
await init(wasmBinary);

export { csp } from "./csp.ts";
