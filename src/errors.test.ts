import { expect, test } from 'vitest'
import { HTMLRewriter } from 'htmlrewriter'

test(
    'errors',
    async () => {
        const res = await fetch('https://example.com')

        const transform = new HTMLRewriter()
            .on('a', {
                element(element) {
                    throw new Error('error')
                },
            })
            .transform(res)
        const err = await transform.text().catch((e) => e)
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toContain('error')
    },
    1000 * 10,
)
test(
    'abort',
    async () => {
        const abortController = new AbortController()
        const res = await fetch('https://example.com', {
            signal: abortController.signal,
        })
        abortController.abort()

        const err = await new HTMLRewriter()
            .on('body', {
                element(e) {
                    e.setAttribute('test', 'one')
                },
            })
            .transform(res)
            .text()
            .catch((e) => e)
            
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toContain('aborted')
    },
    1000 * 10,
)
test(
    'works',
    async () => {
        const res = await fetch('https://example.com', {
            headers: {
                accept: 'text/html',
            },
        })

        const transform = new HTMLRewriter()
            .on('body', {
                element(element) {
                    element.setAttribute("hello", "world")
                },
            })
            .transform(res)
        const text = await transform.text()
        expect(text).toContain('<body hello="world"')
    },
    1000 * 10,
)

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
