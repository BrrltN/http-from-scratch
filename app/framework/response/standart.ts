
import { ResponseBuidler } from "./builder"

export function parseError(description: string) {
    const builder = new ResponseBuidler()
    const { response, error } = builder.setStatus(400, description).build()
    return error === null ? response : error
}

export function timeout() {
    const builder = new ResponseBuidler()
    const { response, error } = builder.setStatus(408, "Request Timeout").build()
    return error === null ? response : error
}

export function notFound() {
    const builder = new ResponseBuidler()
    const { response, error } = builder.setStatus(404, "Not Found").build()
    return error === null ? response : error
}

export function OK() {
    const builder = new ResponseBuidler()
    const { response, error } = builder.setStatus(200, "OK").build()
    return error === null ? response : error
}
