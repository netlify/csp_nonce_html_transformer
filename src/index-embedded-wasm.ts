import { initHtmlRewriter } from "../pkg/html-rewriter-wasm.ts";

import { csp as cspInternal, type Params } from "./csp-internal.ts";

export { type Params } from "./csp-internal.ts";

export function csp(originalResponse: Response, params?: Params) {
  return cspInternal(initHtmlRewriter, originalResponse, params);
}
