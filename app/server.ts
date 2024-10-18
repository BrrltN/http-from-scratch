import net from "node:net"

import { timeout, parseError } from "./framework/response/standart"
import { handleRequest } from "./framework/app"


function enableTimeout(socket: net.Socket, time = 3000) {
    socket.setTimeout(time)
    socket.on('timeout', () => {
        socket.end(timeout())
        socket.destroy()
    })
}

const server = net.createServer((socket) => {
    enableTimeout(socket)

    let httpRequest = ""

    socket.on("data", async (data) => {
        httpRequest += data.toString()

        const response = await handleRequest(httpRequest)

        if (response === null) {
            return
        }
        socket.write(response)
        return socket.end()
    })

    socket.on('error', () => {
        socket.end(parseError('server error'))
    })
})

export const SERVER_PORT = 4221
export const SERVER_HOSTNAME = "localhost"

export function start() {
    server.listen(SERVER_PORT, SERVER_HOSTNAME)
}

export function close(onCloseCallback: Function | null = null) {
    server.close()
    if (onCloseCallback !== null) {
        onCloseCallback()
    }
}