import type { REQUEST_ERROR } from "./type"


export const REQUEST_ERRORS: Record<string, REQUEST_ERROR> = {
    INCOMPLETE: { name: "incomplete", description: "Incomplete HTTP request" },
    PARSE: { name: "parse", description: "Invalid HTTP request" },
    MISSING_BODY_HEADERS: { name: "missing-body-headers", description: "Request should have content-type and content-length headers" },
} as const