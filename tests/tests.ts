import {
  assertMatch,
  assertStrictEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

import * as cheerio from "https://cdn.jsdelivr.net/npm/cheerio/+esm";

import cspParser from "https://cdn.jsdelivr.net/npm/content-security-policy-parser@0.6.0/script/mod.js/+esm";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";
import { assertArrayIncludes } from "https://deno.land/std@0.224.0/assert/assert_array_includes.ts";

import type { Params } from "../src/csp.ts";
const parseContentSecurityPolicy = cspParser.default;
export default async function (
  csp: (originalResponse: Response, params?: Params) => Response,
) {
  Deno.test({
    name: "big html test",
    fn: async () => {
      let response = await fetch("https://html.spec.whatwg.org/");
      response = new Response(response.body, response);

      const result = await csp(response);
      const policy: Map<string, string[]> = parseContentSecurityPolicy(
        result.headers.get("content-security-policy")!,
      );

      const script = policy.get("script-src")!;
      assert(script.find((value) => /'nonce-[-A-Za-z0-9+/]{32}'/.test(value)));

      let $ = cheerio.load(await result.text());

      const scriptsrc = policy.get("script-src")!;
      const nonce = scriptsrc.find((v) => v.startsWith("'nonce-"))?.slice(
        "'nonce-".length,
        -1,
      );
      const scripts = $("script,link[rel=preload][as=script]");
      for (const script of scripts) {
        assertEquals(script.attribs.nonce, nonce);
      }
    },
  });

  Deno.test({
    name: "non-html responses are returned untouched",
    fn: async () => {
      const response = new Response("meow", {
        headers: { "content-type": "text/plain" },
      });

      const result = await csp(response);
      assertStrictEquals(response, result);
      assertEquals(result.headers.has("content-security-policy"), false);
      await response.body?.cancel();
    },
  });

  Deno.test({
    name:
      "non-html (png) responses masquerading as html are returned with identical bodies",
    fn: async () => {
      const response = new Response(
        Uint8Array.from([
          137,
          80,
          78,
          71,
          13,
          10,
          26,
          10,
          0,
          0,
          0,
          13,
          73,
          72,
          68,
          82,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          55,
          110,
          249,
          36,
          0,
          0,
          0,
          10,
          73,
          68,
          65,
          84,
          120,
          1,
          99,
          96,
          0,
          0,
          0,
          2,
          0,
          1,
          115,
          117,
          1,
          24,
          0,
          0,
          0,
          0,
          73,
          69,
          78,
          68,
          174,
          66,
          96,
          130,
        ]),
        {
          headers: { "content-type": "text/html" },
        },
      );
      const originBody = await response.clone().arrayBuffer();

      const result = await csp(response);
      assertEquals(originBody, await result.arrayBuffer());
    },
  });
  Deno.test({
    name: "html responses are modified",
    fn: async () => {
      const response = new Response(
        await Deno.readFile("./tests/fixtures/basic.html"),
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        },
      );

      const result = await csp(response);
      const policy: Map<string, string[]> = parseContentSecurityPolicy(
        result.headers.get("content-security-policy")!,
      );

      const script = policy.get("script-src")!;
      assert(script.find((value) => /'nonce-[-A-Za-z0-9+/]{32}'/.test(value)));

      let $ = cheerio.load(await result.text());

      const scriptsrc = policy.get("script-src")!;
      const nonce = scriptsrc.find((v) => v.startsWith("'nonce-"))?.slice(
        "'nonce-".length,
        -1,
      );
      const scripts = $("script,link[rel=preload][as=script]");
      for (const script of scripts) {
        assertEquals(script.attribs.nonce, nonce);
      }
    },
  });
  Deno.test({
    name: "already existing csp directives are kept",
    fn: async () => {
      const response = new Response("<script>", {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-security-policy":
            "img-src 'self' blob: data:; script-src 'strict-dynamic' 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
        },
      });

      const result = await csp(response);
      const policy: Map<string, string[]> = parseContentSecurityPolicy(
        result.headers.get("content-security-policy") || "",
      );

      assertEquals(policy.get("img-src"), ["'self'", "blob:", "data:"]);
      const script = policy.get("script-src")!;
      const nonce = /'nonce-[-A-Za-z0-9+/]{32}'/;
      assert(script.find((value) => nonce.test(value)));
      assertEquals(script.includes("'strict-dynamic'"), true);
      assertArrayIncludes(script, [
        "'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='",
      ]);
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
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
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
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
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
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
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
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
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
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
      assertMatch(
        await result.text(),
        /^\<script nonce="[-A-Za-z0-9+/]{32}">$/,
      );
    },
  });
}
