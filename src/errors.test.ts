import {
  assertInstanceOf,
  assertStrictEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
// import { HTMLRewriter } from "./index.ts";

Deno.test({
  name: "errors",
  fn: async () => {
    const {HTMLRewriter} = await import("./index.ts");
    const res = await fetch("https://example.com");

    const transform = new HTMLRewriter()
      .on("a", {
        element(_element) {
          throw new Error("error");
        },
      })
      .transform(res);
    const err = await transform.text().catch((e) => e);
    assertInstanceOf(err, Error);
    assertStrictEquals(err.message, "error");
    if (res.body) {
      await res.body.cancel();
    }
  },
});
Deno.test({
  name: "abort",
  fn: async () => {
    const {HTMLRewriter} = await import("./index.ts");
    const abortController = new AbortController();
    const res = await fetch("https://example.com", {
      signal: abortController.signal,
    });
    abortController.abort();

    const err = await new HTMLRewriter()
      .on("body", {
        element(e) {
          e.setAttribute("test", "one");
        },
      })
      .transform(res)
      .text()
      .catch((e) => e);

    assertInstanceOf(err, Error);
    assertStringIncludes(err.message, "aborted");
  },
});
Deno.test({
  name: "works",
  fn: async () => {
    const {HTMLRewriter} = await import("./index.ts");
    const res = await fetch("https://example.com", {
      headers: {
        accept: "text/html",
      },
    });

    const transform = new HTMLRewriter()
      .on("body", {
        element(element) {
          element.setAttribute("hello", "world");
        },
      })
      .transform(res);
    const text = await transform.text();
    assertStringIncludes(text, '<body hello="world"');
  },
});
