import init from "../pkg/html_rewriter.js";

import { HTMLRewriterWrapper } from "./html_rewriter_wrapper.ts";

export const HTMLRewriter: ReturnType<typeof HTMLRewriterWrapper> =
  HTMLRewriterWrapper(
    init(),
  );
