const net = require("net")

const HTTP_RESPONSE = {
    PARSE_ERROR: "HTTP/1.1 400 Invalid HTTP request\r\n\r\n",
    OK: "HTTP/1.1 200 OK\r\n\r\n",
    NOT_FOUND: "HTTP/1.1 404 Not Found\r\n\r\n",
}

/**
 * @param { net.Socket } socket 
 * @param { number } time 
 */
function enableTimeout(socket, time = 3000) {
    socket.setTimeout(time)
    socket.on('timeout', () => {
        socket.end()
    })
}

/**
 * @param { string | undefined } method 
 */
function isAvailableMethod(method) {
    return method === "GET"
        || method === "PUT"
        || method === "POST"
}

/**
 * @param { string | undefined } path 
 */
function isAvailablePath(path) {
    return path[0] === "*" || path[0] === "/"
}

/**
 * @param { string | undefined } httpVersion 
 */
function isAvailableHttpVersion(httpVersion) {
    return httpVersion === "HTTP/1.1"
}

/**
 * 
 * @param { string | undefined } method 
 * @param { string | undefined } path 
 * @param { string | undefined } httpVersion 
 * @returns 
 */
function isAvailableStartLine(method, path, httpVersion) {
    return isAvailableMethod(method)
        && isAvailablePath(path)
        && isAvailableHttpVersion(httpVersion)
}

/**
 * 
 * @param { string } path 
 * @returns {  }
 */
function getHTTPReponse(path) {
    if (path === "/") {
        return HTTP_RESPONSE.OK
    }
    else {
        return HTTP_RESPONSE.NOT_FOUND
    }
}

function handleHTTPRequest(httpRequest) {
    const lines = httpRequest.split("\r\n")

    if (lines.length === 0) {
        return socket.end(HTTP_RESPONSE.PARSE_ERROR)
    }

    const startLine = lines[0]
    const [method, path, httpVersion] = startLine.split(/\s+/)

    const hasParseError = !isAvailableStartLine(method, path, httpVersion)
    if (hasParseError) {
        return socket.end(HTTP_RESPONSE.PARSE_ERROR)
    }

    const response = getHTTPReponse(path)
    return response
}

const server = net.createServer((socket) => {
    enableTimeout(socket)

    let httpRequest = ""

    socket.on("data", (data) => {
        httpRequest += data.toString()
        const clientRequestIsDone = httpRequest.endsWith("\r\n\r\n")

        if (clientRequestIsDone) {
            const response = handleHTTPRequest(httpRequest)
            socket.write(response)
        }
        socket.end()
    })

    socket.on('error', () => {
        socket.end(HTTP_RESPONSE.PARSE_ERROR)
    })
})

server.listen(4221, "localhost")
