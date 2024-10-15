

import type { Context, HTTP_METHOD, RequestParams } from "../type"


type Handler = (context: Context) => Promise<any>

type TreeNode = Map<string, Handler | TreeNode>
type AvailableNode = { node: TreeNode, params: RequestParams }

type ParsedHandler = { handler: Handler, params: RequestParams }
type SuccessParsedHandler = { parsedHandler: ParsedHandler, error: null }
type FailParsedHandler = { parsedHandler: null, error: string }


export class Router {
    static #instance: Router
    #routeTree: Map<HTTP_METHOD, TreeNode> = new Map()
    #paramKey = "__PARAMS__" as const
    #handlerKey = "__HANDLER__" as const

    private constructor() { } // constructeur privé pour forcer le pattern singleton

    static getInstance(): Router {
        if (!Router.#instance) {
            Router.#instance = new Router()
        }
        return Router.#instance
    }

    #getOrCreateMethodTree(method: HTTP_METHOD) {
        const methodTree = this.#routeTree.get(method)
        if (methodTree) {
            return methodTree
        }

        const createdMethodTree: TreeNode = new Map()
        this.#routeTree.set(method, createdMethodTree)

        return createdMethodTree
    }

    #getRouteSegments(path: string) {
        const routeSegments = path.split('/')
        const endsWithSeparator = routeSegments[routeSegments.length - 1] === ""
        if (routeSegments.length > 1 && endsWithSeparator) {
            routeSegments.pop()
        }
        return routeSegments
    }

    #registerRoute(method: HTTP_METHOD, path: string, handler: Handler): void {
        const methodTree = this.#getOrCreateMethodTree(method)

        const routeSegments = this.#getRouteSegments(path)
        let currentNode = methodTree

        for (const [index, routeNode] of routeSegments.entries()) {
            const isLastNode = index === routeSegments.length - 1

            const isParam = routeNode.startsWith(":")

            function getNextNode(node: TreeNode, key: string): TreeNode | null {
                const nextNode = node.get(key)
                if (nextNode && typeof nextNode !== "function") {
                    return nextNode
                }
                return null
            }
            function createEmptyNodeAndAddItToCurrentNode(node: TreeNode, key: string): TreeNode {
                const emptyNode: TreeNode = new Map()
                if (key.startsWith(":")) {
                    key = key.substring(1)
                }
                node.set(key, emptyNode)
                return emptyNode
            }
            function goToNextNode(current: TreeNode, nextNodeName: string) {
                const nextNode = getNextNode(current, nextNodeName) || createEmptyNodeAndAddItToCurrentNode(current, nextNodeName)
                return nextNode
            }

            if (isParam) {
                currentNode = goToNextNode(currentNode, this.#paramKey)
            }

            currentNode = goToNextNode(currentNode, routeNode)

            if (isLastNode) {
                currentNode.set(this.#handlerKey, handler)
            }

        }
    }

    getHandler(method: HTTP_METHOD, route: string): SuccessParsedHandler | FailParsedHandler {
        const methodTree = this.#routeTree.get(method)
        if (!methodTree) {
            return { parsedHandler: null, error: "Method tree not found" }
        }

        const routeSegments = this.#getRouteSegments(route)

        let availableNodes: AvailableNode[] = [{ node: methodTree, params: {} }]

        for (const routeSegment of routeSegments) {

            const segmentAvailableNodes = []

            for (const currentNode of availableNodes) {
                if (currentNode.node === null) {
                    continue
                }
                // Matcher une route statique
                const staticRouteNextNode = currentNode.node.get(routeSegment)
                const matchStaticRoute = staticRouteNextNode !== undefined
                if (matchStaticRoute && typeof staticRouteNextNode !== "function") {
                    segmentAvailableNodes.push({ node: staticRouteNextNode, params: currentNode.params })
                    continue
                }

                // Matcher une route avec paramètre
                const parameterNode = currentNode.node.get(this.#paramKey)
                if (parameterNode === undefined || typeof parameterNode === "function") {
                    continue
                }
                for (const [parameterName, node] of parameterNode.entries()) {
                    if (typeof node === "function") {
                        continue
                    }
                    const params = { ...currentNode.params, [parameterName]: routeSegment }
                    segmentAvailableNodes.push({ node: node, params })
                }
            }

            availableNodes = [...segmentAvailableNodes]
        }

        if (availableNodes.length !== 1) {
            return { parsedHandler: null, error: "Route match more than one handle" }
        }
        const availableNode = availableNodes[0]
        const handler = availableNode.node.get(this.#handlerKey)
        if (typeof handler !== "function") {
            return { parsedHandler: null, error: "Route don't have handler" }
        }

        const parsedHandler = { handler, params: availableNode.params }

        return { parsedHandler, error: null }
    }

    get(path: string, handler: Handler): void {
        this.#registerRoute('GET', path, handler)
    }

    post(path: string, handler: Handler): void {
        this.#registerRoute('POST', path, handler)
    }
}


// const router = Router.getInstance()

// router.get("/", () => "/")
// router.get("/files/:id", () => "/files/:id")
// router.get("/files/some_action", () => "/files/some_action")
// router.get("/files/:label", () => "/files/:label")
// router.get("/files/", () => "/files/")
// router.get("/files/:id/:label", () => "/files/:id/:label")
// router.get("/files/:id/some_action", () => "/files/:id/some_action")
// router.get("/files/:id/some_action/:label", () => "/files/:id/some_action/:label")
// router.get("/files/:id/some_action/otherAction", () => "/files/:id/some_action/otherAction")
// router.get("/files/:id/some_action/otherAction/:label", () => "/files/:id/some_action/otherAction/:label")
// router.post("/", () => "/")
// router.post("/files", () => "/files")
// router.post("/files/:id", () => "/files/:id")
// router.post("/files/some_action", () => "/files/some_action")
// router.post("/files/:label", () => "/files/:label")
// router.post("/files/:id/:label", () => "/files/:id/:label")
// router.post("/files/:id/some_action", () => "/files/:id/some_action")
// router.post("/files/:id/some_action/:label", () => "/files/:id/some_action/:label")
// router.post("/files/:id/some_action/otherAction", () => "/files/:id/some_action/otherAction")
// router.post("/files/:id/some_action/otherAction/:label", () => "/files/:id/some_action/otherAction/:label")


