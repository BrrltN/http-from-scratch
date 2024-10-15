
import type { ContentTypeHeader, HostHeader, UserAgentHeader } from "../type"

type SuccessBuild = { response: string, error: null }
type FailBuild = { response: null; error: string }

export class ResponseBuidler {
    #separator = "\r\n"
    #startline: string | null = null
    #contentType: string | null = null
    #contentLength: string | null = null
    #host: string | null = null
    #userAgent: string | null = null
    #body: string | null = null

    #headers() {
        return [this.#startline, this.#contentType, this.#contentLength, this.#userAgent, this.#host]
    }
    #setContentLength() {
        if (!this.#body || this.#body.length === 0) {
            return
        }
        const encoder = new TextEncoder()
        const encoded = encoder.encode(this.#body)
        this.#contentLength = `Content-Length: ${encoded.length.toString()}`
    }


    setStatus(code: number, description: string) {
        this.#startline = `HTTP/1.1 ${code} ${description}`
        return this
    }
    setContentType(contentType: ContentTypeHeader['value']) {
        this.#contentType = `Content-type: ${contentType}`
        return this
    }
    setUserAgent(userAgent: UserAgentHeader['value']) {
        this.#userAgent = `User-Agent: ${userAgent}`
        return this
    }
    setHost(host: HostHeader['value']) {
        this.#host = `Host: ${host}`
        return this
    }
    setBody(data: string) {
        this.#body = data
        this.#setContentLength()
        return this
    }

    build(): SuccessBuild | FailBuild {
        if (!this.#startline || this.#startline.length === 0) {
            return { response: null, error: "Missing start line" }
        }
        if (this.#body) {
            if (!this.#contentLength) {
                return { response: null, error: "Missing content length header" }
            }
            if (!this.#contentType) {
                return { response: null, error: "Missing content type header" }
            }
        }

        const parsedHeaders = this.#headers()
            .filter(item => !!item)
            .join(this.#separator) + this.#separator

        const response = parsedHeaders + this.#separator + (this.#body || '')

        return { response, error: null }
    }


}

const response = new ResponseBuidler()