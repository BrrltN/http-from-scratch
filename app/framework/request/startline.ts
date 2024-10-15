import { REQUEST_ERRORS } from "../error"
import type { HTTP_METHOD, Queries, REQUEST_ERROR, URI } from "../type"


function parseMethod(method: string): HTTP_METHOD | null {
    if (method === "GET" || method === "POST") {
        return method
    }
    return null
}


function parseURI(input: string): URI | null {
    if (input === "*" || input.startsWith("/")) {
        return input as URI; // Assertion que l'input est de type URI
    }
    return null
}

function parseQueries(rawURI: URI): Queries {
    const queries = new Map()

    const match = rawURI.match(/^([^?]*)(\?(.*))?$/)
    const hasQuery = match !== null && match[3] !== undefined

    if (rawURI === "*" || !hasQuery) {
        return queries
    }

    const rawQuery = match[3]
    for (const query of rawQuery.split('&')) {
        const [key, value] = query.split('=')
        if (!key || !value) {
            continue
        }

        const currentQuery = queries.get(key)
        if (currentQuery !== undefined) {
            currentQuery.push(value)
            continue
        }

        queries.set(key, [value])
    }

    return queries
}


type StartLine = { method: HTTP_METHOD, URI: string, queries: Queries }
type SuccessParseStartLine = { startline: StartLine, error: null }
type FailParseStartLine = { startline: null; error: REQUEST_ERROR }
export function parseStartLine(partialRawRequest: string): SuccessParseStartLine | FailParseStartLine {
    const lines = partialRawRequest.split("\r\n")

    if (lines.length < 3) {
        return { startline: null, error: REQUEST_ERRORS.INCOMPLETE }
    }

    const startLine = lines[0]
    const [rawMethod, rawURI, httpVersion] = startLine.split(/\s+/)

    const method = parseMethod(rawMethod)
    const URI = parseURI(rawURI)

    const isCorruptedStartline = httpVersion !== "HTTP/1.1" || !method || !URI
    if (isCorruptedStartline) {
        return { startline: null, error: REQUEST_ERRORS.PARSE }
    }

    const queries = parseQueries(URI)

    return { startline: { method, URI, queries }, error: null }
}
