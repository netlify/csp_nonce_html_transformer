/* tslint:disable */
/* eslint-disable */
export class Comment {
  free(): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content: string, content_type?: any): void;
  remove(): void;
  readonly removed: boolean;
  text: string;
}
export class Doctype {
  free(): void;
  readonly name: any;
  readonly publicId: any;
  readonly systemId: any;
}
export class DocumentEnd {
  free(): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  append(content: string, content_type?: any): void;
}
export class Element {
  free(): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content: string, content_type?: any): void;
  remove(): void;
  /**
   * @param {string} name
   * @returns {any}
   */
  getAttribute(name: string): any;
  /**
   * @param {string} name
   * @returns {boolean}
   */
  hasAttribute(name: string): boolean;
  /**
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name: string, value: string): void;
  /**
   * @param {string} name
   */
  removeAttribute(name: string): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  prepend(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  append(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  setInnerContent(content: string, content_type?: any): void;
  removeAndKeepContent(): void;
  readonly attributes: any;
  readonly namespaceURI: any;
  readonly removed: boolean;
  tagName: string;
}
export class EndTag {
  free(): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content: string, content_type?: any): void;
  remove(): void;
  name: string;
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
   * @param {any} handlers
   */
  onDocument(handlers: any): void;
  /**
   * @param {Uint8Array} chunk
   */
  write(chunk: Uint8Array): void;
  end(): void;
  readonly asyncifyStackPtr: number;
}
export class TextChunk {
  free(): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  before(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  after(content: string, content_type?: any): void;
  /**
   * @param {string} content
   * @param {any | undefined} [content_type]
   */
  replace(content: string, content_type?: any): void;
  remove(): void;
  readonly lastInTextNode: boolean;
  readonly removed: boolean;
  readonly text: string;
}
