/* tslint:disable */
/* eslint-disable */
export class Element {
  free(): void;
  /**
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name: string, value: string): void;
}
export class HTMLRewriter {
  free(): void;
  /**
   * @param {Function} output_sink
   * @param {any | undefined} [options]
   */
  constructor(output_sink: Function, options?: any);
  /**
   * @param {string} selector
   * @param {any} handlers
   */
  on(selector: string, handlers: any): void;
  /**
   * @param {Uint8Array} chunk
   */
  write(chunk: Uint8Array): void;
  end(): void;
}
