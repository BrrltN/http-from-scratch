import type { Context } from "../framework/type"

import { promises as fs } from 'fs'
import { join } from 'path'

async function checkFile(filePath: string) {
    try {
        await fs.access(filePath)
        return true
    } catch (err) {
        return false
    }
}

async function writeFile(filePath: string, data: string): Promise<void> {
    try {
        const directory = join(filePath, '..')
        await fs.mkdir(directory, { recursive: true })
        await fs.writeFile(filePath, data, 'utf8')
    } catch (error) {
        let message = "WRITE FILE ERROR"
        if (typeof error === "object" && error && 'message' in error && error.message) {
            message += error.message
        }
        throw new Error(message)
    }
}

export async function index({ request, response }: Context) {
    response.setContentType('text/plain')
    await response.setBody("Hello World")
}

export async function echoRoute({ request, response }: Context) {
    const search = request.params.label
    if (search === undefined) {
        return
    }

    response.setContentType('text/plain')
    await response.setBody(search)
}

export async function echoUserAgent({ request, response }: Context) {
    const userAgent = request.headers.get('userAgent') || "No User-Agent"
    response.setContentType('text/plain')
    await response.setBody(userAgent)
}

export async function readFileIfExist({ request, response }: Context) {
    const filename = request.params.filename
    const directory = process.argv[3] || `${process.cwd()}/files/`
    if (!filename || !directory) {
        return response.setStatus(500, "Internal error")
    }

    const filePath = `${directory}${filename}`
    const hasRegisteredFile = await checkFile(filePath)
    if (!hasRegisteredFile) {
        return response.setStatus(404, "Not Found")
    }

    const fileContent = await fs.readFile(filePath, 'utf8')

    response.setContentType('application/octet-stream')
    await response.setBody(fileContent)
}

export async function registerFile({ request, response }: Context) {
    const filename = request.params.filename
    const directory = process.argv[3] || `${process.cwd()}/files/`
    if (!filename || !directory) {
        return response.setStatus(500, "Not Found")
    }

    const content = request.body
    if (content === null || content === "") {
        return response.setStatus(422, "Missing body")
    }

    const filePath = `${directory}${filename}`
    await writeFile(filePath, content)
}
