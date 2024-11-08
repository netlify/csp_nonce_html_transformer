import init from "../pkg/html_rewriter.js";
import { HTMLRewriterWrapper } from "./html_rewriter_wrapper.ts";
import { Element } from "./types.d.ts";

type Params = {
  /**
   * When true, uses the `Content-Security-Policy-Report-Only` header instead
   * of the `Content-Security-Policy` header. Setting to `true` is useful for
   * testing the CSP with real production traffic without actually blocking resources.
   */
  reportOnly?: boolean;
  /**
   * The relative or absolute URL to report any violations. If left undefined,
   * violations will not be reported anywhere, which this plugin deploys. If
   * the response already has a `report-uri` directive defined in its CSP header,
   * then that value will take precedence.
   */
  reportUri?: string;
  /**
   * When true, adds `'unsafe-eval'` to the CSP for easier adoption. Set to
   * `false` to have a safer policy if your code and code dependencies does
   *  not use `eval()`.
   */
  unsafeEval?: boolean;
  strictDynamic?: boolean;
  unsafeInline?: boolean;
  self?: boolean;
  https?: boolean;
  http?: boolean;
  /**
   * A number from 0 to 1, but 0 to 100 is also supported, along with a trailing %.
   *
   * You can ramp up or ramp down the inclusion of the `Content-Security-Policy`
   * header by setting this to a value between `0` and `1`.
   *
   * Any value in between `0` and `1` will include the nonce in randomly distributed traffic.
   *
   * For example, a value of `0.25` will put the new directives in the `Content-Security-Policy`
   * header for 25% of responses. The other 75% of responses will have the new directives
   * in the `Content-Security-Policy-Report-Only` header.
   */
  distribution?: string;
};

const hexOctets: string[] = [];

for (let i = 0; i <= 255; ++i) {
  const hexOctet = i.toString(16).padStart(2, "0");
  hexOctets.push(hexOctet);
}

function uInt8ArrayToBase64String(input: Uint8Array): string {
  let res = "";

  for (let i = 0; i < input.length; i++) {
    res += String.fromCharCode(parseInt(hexOctets[input[i]], 16));
  }

  return btoa(res);
}

export async function csp(response: Response, params?: Params) {
  const isHTMLResponse = response.headers.get("content-type")?.startsWith(
    "text/html",
  );
  if (!isHTMLResponse) {
    return response;
  }

  let header = params && params.reportOnly
    ? "content-security-policy-report-only"
    : "content-security-policy";

  // distribution is a number from 0 to 1,
  // but 0 to 100 is also supported, along with a trailing %
  const distribution = params?.distribution;
  if (distribution) {
    const threshold = distribution.endsWith("%") || parseFloat(distribution) > 1
      ? Math.max(parseFloat(distribution) / 100, 0)
      : Math.max(parseFloat(distribution), 0);
    const random = Math.random();
    // if a roll of the dice is greater than our threshold...
    if (random > threshold && threshold <= 1) {
      if (header === "content-security-policy") {
        // if the real CSP is set, then change to report only
        header = "content-security-policy-report-only";
      } else {
        // if the CSP is set to report-only, return unadulterated response
        return response;
      }
    }
  }

  const nonce = uInt8ArrayToBase64String(
    crypto.getRandomValues(new Uint8Array(24)),
  );

  const rules = [
    `'nonce-${nonce}'`,
    params?.unsafeEval && `'unsafe-eval'`,
    params?.strictDynamic && `'strict-dynamic'`,
    params?.unsafeInline && `'unsafe-inline'`,
    params?.self && `'self'`,
    params?.https && `https:`,
    params?.http && `http:`,
  ].filter(Boolean);
  const scriptSrc = `script-src ${rules.join(" ")}`;

  const csp = response.headers.get(header) as string;
  if (csp) {
    const directives = csp
      .split(";")
      .map((directive) => {
        // prepend our rules for any existing directives
        const d = directive.trim();
        // intentionally add trailing space to avoid mangling `script-src-elem`
        if (d.startsWith("script-src ")) {
          // append with trailing space to include any user-supplied values
          // https://github.com/netlify/plugin-csp-nonce/issues/72
          return d.replace("script-src ", `${scriptSrc} `).trim();
        }
        // intentionally omit report-uri: theirs should take precedence
        return d;
      })
      .filter(Boolean);
    // push our rules if the directives don't exist yet
    if (!directives.find((d) => d.startsWith("script-src "))) {
      directives.push(scriptSrc);
    }
    if (
      params?.reportUri && !directives.find((d) => d.startsWith("report-uri"))
    ) {
      directives.push(`report-uri ${params.reportUri}`);
    }
    const value = directives.join("; ");
    response.headers.set(header, value);
  } else {
    // make a new ruleset of directives if no CSP present
    const value = [scriptSrc];
    if (params?.reportUri) {
      value.push(`report-uri ${params.reportUri}`);
    }
    response.headers.set(header, value.join("; "));
  }

  const querySelectors = ["script", 'link[rel="preload"][as="script"]'];
  const HTMLRewriter: ReturnType<typeof HTMLRewriterWrapper> =
    HTMLRewriterWrapper(
      await init(),
    );
  return new HTMLRewriter()
    .on(querySelectors.join(","), {
      element(element: Element) {
        element.setAttribute("nonce", nonce);
      },
    })
    .transform(response);
}
