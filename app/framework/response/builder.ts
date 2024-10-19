import zlib from "node:zlib"
import { promisify } from "node:util"

import type { ContentTypeHeader, HostHeader, Request, UserAgentHeader } from "../type"

const gzip = promisify(zlib.gzip)

type SuccessBuild = { response: string | Buffer, error: null }
type FailBuild = { response: null; error: string }

export class ResponseBuidler {
    constructor(request?: Request) {
        if (request === undefined) {
            return
        }
        this.#request = request

        if (request.method === "GET") {
            this.setStatus(200, "OK")
        }
        if (request.method === "POST") {
            this.setStatus(201, "Created")
        }
    }
    #request: Request | null = null
    #separator = "\r\n"
    #startline: string | null = null
    #contentType: string | null = null
    #contentLength: string | null = null
    #contentEncoding: string | null = null
    #host: string | null = null
    #userAgent: string | null = null
    #body: string | Buffer | null = null

    #headers() {
        return [this.#startline, this.#contentType, this.#contentLength, this.#contentEncoding, this.#userAgent, this.#host]
    }
    #setContentLength() {
        if (!this.#body || this.#body.length === 0) {
            return
        }
        let contentLength = "0"
        if (Buffer.isBuffer(this.#body)) {
            contentLength = this.#body.byteLength.toString()
        }
        else {
            const encoder = new TextEncoder()
            const encoded = encoder.encode(this.#body.toString())
            contentLength = encoded.length.toString()
        }
        this.#contentLength = `Content-Length: ${contentLength}`
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
    setContentEncoding() {
        const requiredEncoding = this.#request !== null && this.#request.headers.get('acceptEncoding')
        if (requiredEncoding) {
            this.#contentEncoding = `Content-Encoding: ${requiredEncoding}`
        }
        return this
    }
    async setBody(data: string) {
        this.setContentEncoding()

        if (this.#contentEncoding !== null) {
            const compressedBody = await gzip(data)
            this.#body = compressedBody
        }
        else {
            this.#body = data
        }

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

        const response = parsedHeaders + this.#separator
        if (Buffer.isBuffer(this.#body)) {
            return { response: Buffer.concat([Buffer.from(response), this.#body]), error: null }
        }
        return { response: response + (this.#body || ''), error: null }
    }
}