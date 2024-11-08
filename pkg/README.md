# csp-html-rewriter

## Usage

```ts
import { HTMLRewriter } from "htmlrewriter";

const rewriter = new HTMLRewriter();

rewriter.on("a", {
  element(element) {
    element.setAttribute("href", "https://www.baidu.com");
  },
});
const res = rewriter.transform(
  new Response('<a href="https://www.google.com">google</a>'),
);
console.log(await res.text());
```
