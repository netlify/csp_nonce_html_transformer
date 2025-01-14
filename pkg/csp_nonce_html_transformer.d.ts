/* tslint:disable */
/* eslint-disable */
export class Element {
  private constructor();
  free(): void;
  setAttribute(name: string, value: string): void;
}
export class HTMLRewriter {
  free(): void;
  constructor(output_sink: Function);
  on(selector: string, handlers: any): void;
  write(chunk: Uint8Array): void;
  end(): void;
}

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_element_free: (a: number, b: number) => void;
  readonly element_setAttribute: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => [number, number];
  readonly __wbg_htmlrewriter_free: (a: number, b: number) => void;
  readonly htmlrewriter_new: (a: any) => number;
  readonly htmlrewriter_on: (
    a: number,
    b: number,
    c: number,
    d: any,
  ) => [number, number];
  readonly htmlrewriter_write: (
    a: number,
    b: number,
    c: number,
  ) => [number, number];
  readonly htmlrewriter_end: (a: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(
  module: { module: SyncInitInput } | SyncInitInput,
): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
