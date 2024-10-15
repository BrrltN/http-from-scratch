import type { Context, Request } from "./type"

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

export async function handleRequest(httpRequest: string): Promise<string | null> {

    // Parser la requête : method, URI, headers, body ++ queryParmeter
    const { request, error: requestParseError } = parseResquest(httpRequest)

    if (requestParseError !== null) {
        const isParseError = requestParseError.name !== "incomplete"
        return isParseError
            ? parseError(requestParseError.description)
            : null
    }

    // Récupérer le handler + URL params
    const { parsedHandler, error: routeError } = getRouteHandler(request)
    if (routeError !== null) {
        return notFound()
    }

    // Injecter les URL params dans la request
    if (parsedHandler.params) {
        request.params = parsedHandler.params
    }

    // Concevoir une réponse par défaut
    const builder = new ResponseBuidler()

    // builder.setContentType('text/plain')

    if (request.method === "GET") {
        builder.setStatus(200, "OK")
    }
    if (request.method === "POST") {
        builder.setStatus(201, "Created")
    }


    // Construire un contexte ( req, res )
    const context: Context = { request, response: builder }

    await parsedHandler.handler(context)

    // Build la réponse
    const { response, error } = builder.build()
    if (error !== null) {
        return parseError(error)
    }

    console.log({ response })

    // Envoyer la réponse sous forme de string
    return response
}