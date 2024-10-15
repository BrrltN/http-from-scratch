import type { AcceptHeader, ContentLengthHeader, ContentTypeHeader, HostHeader, MediaTypePreference, REQUEST_ERROR, UserAgentHeader } from "../type"

import { REQUEST_ERRORS } from "../error"
import { TypedHeaderMap } from "../type"

function normalizeRawHeaderKeyValue(header: string) {
    const findKeyValueRegex = /([^:]*):\s*(.*)/
    const match = header.match(findKeyValueRegex)

    if (match === null) {
        return null
    }

    const key = match[1]
    let value = match[2]

    const beginWithSpaceRegex = /^\s/
    if (beginWithSpaceRegex.test(value)) {
        value = value.slice(1)
    }
    return { key, value }
}

function parseRawContentLength(key: string, value: string): ContentLengthHeader | null {
    const castedValue = Number(value.trim())
    if (key !== "Content-Length" || !Number.isInteger(castedValue)) {
        return null
    }
    return { key: "contentLength", value: castedValue }
}

function parseRawContentType(key: string, value: string): ContentTypeHeader | null {
    const isAvailableContentType = value === "text/plain" || value === "application/octet-stream"
    if (key !== "Content-Type" || !isAvailableContentType) {
        return null
    }

    return { key: "contentType", value }
}

function parseRawUserAgent(key: string, value: string): UserAgentHeader | null {
    const isAvailableUserAgent = typeof value === "string"
    if (key !== "User-Agent" || !isAvailableUserAgent) {
        return null
    }

    return { key: "userAgent", value }
}

function parseRawHost(key: string, value: string): HostHeader | null {
    const isAvailableHost = typeof value === "string"
    if (key !== "Host" || !isAvailableHost) {
        return null
    }

    return { key: "host", value }
}


function parseRawAcceptHeader(key: string, value: string): AcceptHeader | null {
    if (key !== "Accept") {
        return null
    }

    const acceptedMedias: MediaTypePreference[] = []
    const rawMedias = value.split(',')


    for (const media of rawMedias) {
        const [type, rawPriority] = media.trim().split(';')
        let priority = 1
        if (rawPriority && rawPriority.startsWith('q=')) {
            priority = parseFloat(rawPriority.split('=')[1])
        }
        acceptedMedias.push({ type: type.trim(), priority })
    }

    acceptedMedias.sort((a, b) => b.priority - a.priority)

    return { key: "accept", value: acceptedMedias }
}

type SuccessParseHeaders = { headers: TypedHeaderMap, error: null }
type FailParseHeaders = { headers: null; error: REQUEST_ERROR }
export function parseHeaders(partialRawRequest: string): SuccessParseHeaders | FailParseHeaders {
    const lines = partialRawRequest.split("\r\n")
    const endHeaderIndex = lines.findIndex(line => line === "")

    const headers = new TypedHeaderMap()
    if (endHeaderIndex === -1) {
        return { headers: null, error: REQUEST_ERRORS.INCOMPLETE }
    }

    const rawHeaderLines = lines.slice(1, endHeaderIndex)

    for (const header of rawHeaderLines) {

        const normalizedRawHeader = normalizeRawHeaderKeyValue(header)
        if (!normalizedRawHeader) {
            continue
        }

        const { key, value } = normalizedRawHeader

        const contentLength = parseRawContentLength(key, value)
        if (contentLength) {
            headers.set(contentLength.key, contentLength.value)
        }

        const contentType = parseRawContentType(key, value)
        if (contentType) {
            headers.set(contentType.key, contentType.value)
        }

        const userAgent = parseRawUserAgent(key, value)
        if (userAgent) {
            headers.set(userAgent.key, userAgent.value)
        }

        const accept = parseRawAcceptHeader(key, value)
        if (accept) {
            headers.set(accept.key, accept.value)
        }

        const host = parseRawHost(key, value)
        if (host) {
            headers.set(host.key, host.value)
        }
    }

    return { headers, error: null }
}