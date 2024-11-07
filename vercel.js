import init from './dist/html_rewriter.js'

import wasm from './dist/html_rewriter_bg.wasm?module'
import { HTMLRewriterWrapper } from './dist/html_rewriter_wrapper.js'

export const HTMLRewriter = HTMLRewriterWrapper(init(wasm))
