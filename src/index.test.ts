import {
  assertMatch,
  assertStrictEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { csp } from "./index.ts";

Deno.test({
  name: "non-html responses are returned untouched",
  fn: async () => {
    const response = new Response("meow", {
      headers: { "content-type": "text/plain" },
    });

    const result = await csp(response);
    assertStrictEquals(response, result);
    await response.body?.cancel();
  },
});
Deno.test({
  name: "html responses are modified",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

    const result = await csp(response);
    assertMatch(
      result.headers.get("content-security-policy")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}'$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name: "already existing csp directives are kept",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-security-policy":
          "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
      },
    });

    const result = await csp(response);
    assertMatch(
      result.headers.get("content-security-policy")!,
      /^img-src 'self' blob: data:; script-src 'nonce-[-A-Za-z0-9+/]{32}' 'sha256-\/Cb4VxgL2aVP0MVDvbP0DgEOUv\+MeNQmZX4yXHkn\/c0='/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name:
    "distribution set to 0 and content-security-policy header set will cause the new directives to be added to content-security-policy-report-only",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-security-policy":
          "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
      },
    });

    const result = await csp(response, { distribution: "0" });
    assertStrictEquals(
      result.headers.get("content-security-policy")!,
      "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
    );
    assertMatch(
      result.headers.get("content-security-policy-report-only")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}'$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name:
    "distribution set to 0% and content-security-policy header set will cause the new directives to be added to content-security-policy-report-only",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-security-policy":
          "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
      },
    });

    const result = await csp(response, { distribution: "0%" });
    assertStrictEquals(
      result.headers.get("content-security-policy")!,
      "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
    );
    assertMatch(
      result.headers.get("content-security-policy-report-only")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}'$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name:
    "params.reportOnly set to true will cause the new directives to be added to content-security-policy-report-only",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

    const result = await csp(response, { reportOnly: true });
    assertMatch(
      result.headers.get("content-security-policy-report-only")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}'$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name:
    "params.unsafeEval set to true will cause unsafeEval to be added to the directives",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

    const result = await csp(response, { unsafeEval: true });
    assertMatch(
      result.headers.get("content-security-policy")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}' 'unsafe-eval'$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
Deno.test({
  name:
    "params.reportUri set to true will cause reportUri to be added to the directives",
  fn: async () => {
    const response = new Response("<script>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

    const result = await csp(response, { reportUri: "https://example.com" });
    assertMatch(
      result.headers.get("content-security-policy")!,
      /^script-src 'nonce-[-A-Za-z0-9+/]{32}'; report-uri https:\/\/example\.com$/,
    );
    assertMatch(await result.text(), /^\<script nonce="[-A-Za-z0-9+/]{32}">$/);
  },
});
