import init from './dist/html_rewriter.js'

import { HTMLRewriterWrapper } from './dist/html_rewriter_wrapper.js'

export const HTMLRewriter = HTMLRewriterWrapper(
    init(fetch(new URL('./dist/html_rewriter_bg.wasm', import.meta.url))),
)
