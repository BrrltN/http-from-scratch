import { ResponseBuidler } from "./response/builder"

export type HTTP_METHOD = "GET" | "POST"

export type Request = {
    method: HTTP_METHOD,
    URI: string,
    queries: Queries,
    params: RequestParams,
    headers: TypedHeaderMap,
    body: string | null
}

export type MediaTypePreference = { type: string, priority: number }
export type ContentLengthHeader = { key: "contentLength", value: number }
export type ContentTypeHeader = { key: "contentType", value: "text/plain" | "application/octet-stream" }
export type UserAgentHeader = { key: "userAgent", value: string }
export type AcceptHeader = { key: "accept", value: MediaTypePreference[] }
export type HostHeader = { key: "host", value: string }

type Header = ContentLengthHeader
    | ContentTypeHeader
    | UserAgentHeader
    | AcceptHeader
    | HostHeader

type ExtractHeaderMap<T extends { key: string, value: any }> = {
    [H in T as H['key']]: H['value']
}

type HeaderMap = ExtractHeaderMap<Header>

export class TypedHeaderMap extends Map<keyof HeaderMap, HeaderMap[keyof HeaderMap]> {
    set<K extends keyof HeaderMap>(key: K, value: HeaderMap[K]): this {
        return super.set(key, value)
    }
    get<K extends keyof HeaderMap>(key: K): HeaderMap[K] | undefined {
        return super.get(key) as HeaderMap[K] | undefined
    }
}

export type REQUEST_ERROR = { name: string, description: string }

export type URI = "*" | `/${string}`
export type Queries = Map<string, string[]>
export type RequestParams = Record<string, string | undefined>

export type Context = { request: Request, response: ResponseBuidler }