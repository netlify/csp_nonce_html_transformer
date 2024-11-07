/* tslint:disable */
/* eslint-disable */
/**
*/
export class Element {
  free(): void;
/**
* @param {string} name
* @param {string} value
*/
  setAttribute(name: string, value: string): void;
}
/**
*/
export class HTMLRewriter {
  free(): void;
/**
* @param {any} output_sink
*/
  constructor(output_sink: any);
/**
* @param {string} selector
* @param {any} handlers
*/
  on(selector: string, handlers: any): void;
/**
* @param {Uint8Array} chunk
*/
  write(chunk: Uint8Array): void;
/**
*/
  end(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_htmlrewriter_free: (a: number) => void;
  readonly htmlrewriter_new: (a: number) => number;
  readonly htmlrewriter_on: (a: number, b: number, c: number, d: number) => void;
  readonly htmlrewriter_write: (a: number, b: number, c: number) => void;
  readonly htmlrewriter_end: (a: number) => void;
  readonly __wbg_element_free: (a: number) => void;
  readonly element_setAttribute: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
