export class Element {
    setAttribute(name: string, value: string): this
}

export interface ElementHandlers {
    element?(element: Element): void
}

export class HTMLRewriter {
    constructor(
        outputSink: (chunk: Uint8Array) => void,
    )
    on(selector: string, handlers: ElementHandlers): this
    write(chunk: Uint8Array): void
    end(): void
    free(): void
}
