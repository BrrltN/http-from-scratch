
import { REQUEST_ERRORS } from "../error";
import type { HTTP_METHOD, REQUEST_ERROR, TypedHeaderMap } from "../type"

type SuccessParseBody = { body: string | null, error: null }
type FailParseBody = { body: null; error: REQUEST_ERROR }
export function parseBody(method: HTTP_METHOD, headers: TypedHeaderMap, partialRawRequest: string): SuccessParseBody | FailParseBody {

    if (method !== "POST") {
        return { body: null, error: null }
    }

    const contentType = headers.get("contentType")
    const contentLength = headers.get("contentLength")

    if (!contentType || !contentLength) {
        return { body: null, error: REQUEST_ERRORS.MISSING_BODY_HEADERS }
    }

    const lines = partialRawRequest.split("\r\n")
    const endHeaderIndex = lines.findIndex(line => line === "")
    if (endHeaderIndex === -1) {
        return { body: null, error: REQUEST_ERRORS.INCOMPLETE }
    }

    const rawBodyLines = lines.slice(endHeaderIndex + 1)
    const rawBody = rawBodyLines.join()

    return { body: rawBody, error: null }
}