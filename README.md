# csp_nonce_html_transformer

Use a [nonce](https://content-security-policy.com/nonce/) for the `script-src`
directive of your Content Security Policy (CSP) to help prevent
[cross-site scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#cross-site_scripting_xss)
attacks.

This functions takes a response and will add a header and transforms the HTML
response body to contain a unique nonce on every request.

Scripts that do not contain a matching `nonce` attribute, or that were not
created from a trusted script (see
[strict-dynamic](https://content-security-policy.com/strict-dynamic/)), will not
be allowed to run.

If the response already has a CSP, this will merge the directives it generates
with your the directives.
