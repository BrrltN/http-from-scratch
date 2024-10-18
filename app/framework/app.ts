import type { Request } from "./type"

import { Router } from "./router/router"
import { parseResquest } from "./request/request"
import { parseError, notFound } from "./response/standart"
import { ResponseBuidler } from "./response/builder"

import '../domain/routes'

function getRouteHandler(request: Request) {
    const path = request.URI
    const method = request.method

    const router = Router.getInstance()
    return router.getHandler(method, path)
}

export async function handleRequest(httpRequest: string): Promise<string | Buffer | null> {

    const { request, error: requestParseError } = parseResquest(httpRequest)

    if (requestParseError !== null) {
        const isParseError = requestParseError.name !== "incomplete"
        return isParseError
            ? parseError(requestParseError.description)
            : null
    }

    const { parsedHandler, error: routeError } = getRouteHandler(request)
    if (routeError !== null) {
        return notFound()
    }

    if (parsedHandler.params) {
        request.params = parsedHandler.params
    }

    const builder = new ResponseBuidler(request)

    await parsedHandler.handler({ request, response: builder })

    const { response, error } = builder.build()
    if (error !== null) {
        return parseError(error)
    }

    // Envoyer la réponse sous forme de string
    return response
}