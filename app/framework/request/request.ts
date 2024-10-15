import type { Request, REQUEST_ERROR } from "../type"

import { parseStartLine } from "./startline"
import { parseHeaders } from "./header"
import { parseBody } from "./body"

type SuccessParseRequest = { request: Request, error: null }
type FailParseRequest = { request: null; error: REQUEST_ERROR }
export function parseResquest(partialRawRequest: string): SuccessParseRequest | FailParseRequest {

    const { startline, error: startLineError } = parseStartLine(partialRawRequest)
    if (startLineError !== null) {
        return { request: null, error: startLineError }
    }

    const { headers, error: headerError } = parseHeaders(partialRawRequest)
    if (headerError !== null) {
        return { request: null, error: headerError }
    }

    const { body, error: bodyError } = parseBody(startline.method, headers, partialRawRequest)
    if (bodyError) {
        return { request: null, error: bodyError }
    }

    return {
        request: {
            method: startline.method,
            URI: startline.URI,
            queries: startline.queries,
            params: {},
            headers: headers,
            body: body,
        },
        error: null
    }
}