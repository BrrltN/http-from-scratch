import { test } from "@japa/runner"
import { Router } from "./router"

test.group('Router tests', (group) => {
    let router: Router

    group.each.setup(() => {
        router = Router.getInstance()
    })
    group.each.teardown(() => {
        router.reset()
    })

    test('Resolve undefined routes return an error and handler is null', async ({ assert }) => {
        const { parsedHandler, error } = router.getHandler("GET", "/undefined-route")

        assert.isNull(parsedHandler)
        assert.isNotNull(error)
        assert.isString(error)
    })

    // Simple Static routes

    test('Register and resolve a static GET route', async ({ assert }) => {
        const handler = async () => { }
        router.get("/static", handler)
        const { parsedHandler } = router.getHandler("GET", "/static")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handler)
    })

    test('Register and resolve a static POST route', async ({ assert }) => {
        const handler = async () => { }
        router.post("/static", handler)
        const { parsedHandler } = router.getHandler("POST", "/static")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handler)
    })

    // Simple Dynamique routes

    test('Register and resolve a dynamic GET route', async ({ assert }) => {
        const handler = async () => { }
        router.get("/dynamic/:label", handler)
        const { parsedHandler } = router.getHandler("GET", "/dynamic/hey")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handler)
    })

    test('Register and resolve a dynamic POST route', async ({ assert }) => {
        const handler = async () => { }
        router.post("/dynamic/:label", handler)
        const { parsedHandler } = router.getHandler("POST", "/dynamic/hey")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handler)
    })

    test('Dynamic route provide run time dynamic param', async ({ assert }) => {
        const paramName = "label"
        const paramValue = "hey"
        const handler = async () => { }
        router.get(`/dynamic/:${paramName}`, handler)
        const { parsedHandler } = router.getHandler("GET", `/dynamic/${paramValue}`)

        assert.isNotNull(parsedHandler)
        assert.isObject(parsedHandler?.params)
        assert.isNotEmpty(parsedHandler?.params)
        assert.isDefined(parsedHandler?.params?.[paramName])
        assert.equal(parsedHandler?.params?.[paramName], paramValue)
    })

    // routes conflict

    test("Can register 2 same routes", async ({ assert }) => {
        const handler = async () => { }
        router.get("/static", handler)
        router.get("/static", handler)

        const { parsedHandler } = router.getHandler("GET", "/static")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handler)
    })

    test('2 routes with and without trailing slashes return the same handler', async ({ assert }) => {
        const handlerWithoutSlash = async () => { }
        router.get("/without", handlerWithoutSlash)

        const handlerWithTrailingSlash = async () => { }
        router.get("/with/", handlerWithTrailingSlash)


        const { parsedHandler: parsedHandlerWithoutSlash } = router.getHandler("GET", "/without/")
        assert.isNotNull(parsedHandlerWithoutSlash)
        assert.strictEqual(parsedHandlerWithoutSlash?.handler, handlerWithoutSlash)

        const { parsedHandler: parsedHandlerWithTrailingSlash } = router.getHandler("GET", "/with")
        assert.isNotNull(parsedHandlerWithTrailingSlash)
        assert.strictEqual(parsedHandlerWithTrailingSlash?.handler, handlerWithTrailingSlash)
    })

    test("Can register 2 same routes and different handler, return the last handler defined", async ({ assert }) => {
        const handlerB = async () => { }
        const handlerA = async () => { }
        router.get("/static", handlerA)
        router.get("/static", handlerB)

        const { parsedHandler } = router.getHandler("GET", "/static")
        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handlerB)
    })

    test("conflict with 2 routes with dynamic parameter return first handler", async ({ assert }) => {
        const handlerA = async () => { }
        const handlerB = async () => { }

        router.get("/user/:label", handlerB)
        router.get("/user/:id", handlerA) // first handler defined

        const { parsedHandler } = router.getHandler("GET", "/user/someVariableValue")

        assert.isNotNull(parsedHandler)
        assert.strictEqual(parsedHandler?.handler, handlerB)
    })

    test("Can resolve complexe routes without dynamic conflict", async ({ assert }) => {
        type Route = {
            method: "GET" | "POST"
            route: string,
            param?: Record<string, string>,
            handler: () => Promise<void>
        }
        const routes: Route[] = [
            { method: "GET", route: "/", handler: async () => { } },
            { method: "GET", route: "/user", handler: async () => { } },
            { method: "GET", route: "/user/:id", param: { id: "111" }, handler: async () => { } },
            { method: "GET", route: "/user/some_action", handler: async () => { } },
            { method: "GET", route: "/user/:id/:label", param: { id: "222", label: "getbar" }, handler: async () => { } },
            { method: "GET", route: "/user/:id/some_action", param: { id: "333" }, handler: async () => { } },
            { method: "GET", route: "/user/:id/some_action/:label", param: { id: "444", label: "getbaz" }, handler: async () => { } },
            { method: "GET", route: "/user/:id/some_action/otherAction", param: { id: "555" }, handler: async () => { } },
            { method: "GET", route: "/user/:id/some_action/otherAction/:label", param: { id: "666", label: "getbar" }, handler: async () => { } },
            { method: "POST", route: "/", handler: async () => { } },
            { method: "POST", route: "/user", handler: async () => { } },
            { method: "POST", route: "/user/:id", param: { id: "777" }, handler: async () => { } },
            { method: "POST", route: "/user/some_action", handler: async () => { } },
            { method: "POST", route: "/user/:id/:label", param: { id: "888", label: "getbar" }, handler: async () => { } },
            { method: "POST", route: "/user/:id/some_action", param: { id: "999" }, handler: async () => { } },
            { method: "POST", route: "/user/:id/some_action/:label", param: { id: "789", label: "getbaz" }, handler: async () => { } },
            { method: "POST", route: "/user/:id/some_action/otherAction", param: { id: "456" }, handler: async () => { } },
            { method: "POST", route: "/user/:id/some_action/otherAction/:label", param: { id: "123", label: "getbar" }, handler: async () => { } },
        ]

        // Enregistrer toutes les routes
        for (const route of routes) {
            if (route.method === "GET") {
                router.get(route.route, route.handler)
            }
            if (route.method === "POST") {
                router.post(route.route, route.handler)
            }
        }

        // Tester pour chaque route que les paramètres sont bon et qu'on a le bon handler
        for (const route of routes) {
            const replacedRoute = route.route.replace(/:([a-zA-Z]+)/g, (_, paramName) => {
                const params = route.param
                if (params === undefined) {
                    return paramName
                }
                return params[paramName] !== undefined ? params[paramName] : `:${paramName}`;
            })
            const { parsedHandler } = router.getHandler(route.method, replacedRoute)

            assert.isNotNull(parsedHandler)
            assert.strictEqual(parsedHandler?.handler, route.handler)

            const hasURLParameters = route.param !== undefined

            if (hasURLParameters) {
                assert.isDefined(parsedHandler?.params)
                assert.isObject(parsedHandler?.params)
                assert.isNotEmpty(parsedHandler?.params)

                const parsedParameters = parsedHandler?.params
                if (route.param === undefined || parsedParameters === undefined) {
                    return
                }
                for (const [key, value] of Object.entries(route.param)) {
                    assert.isDefined(parsedParameters[key])
                    assert.strictEqual(parsedParameters[key], value)
                }
            }
        }
    })

})
