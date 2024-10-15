import type { Context } from "../framework/type"

import { access, readFile, writeFile } from 'fs/promises'


async function checkFile(pathToFile: string) {
    try {
        await access(pathToFile)
        return true
    } catch (err) {
        return false
    }
}

export async function index({ request, response }: Context) {
    response
        .setContentType('text/plain')
        .setBody("Hello World")
}

export async function echoRoute({ request, response }: Context) {
    const search = request.params.label
    if (search === undefined) {
        return
    }

    response
        .setContentType('text/plain')
        .setBody(search)
}

export async function echoUserAgent({ request, response }: Context) {
    const userAgent = request.headers.get('userAgent') || "No User-Agent"
    response
        .setContentType('text/plain')
        .setBody(userAgent)
}

export async function readFileIfExist({ request, response }: Context) {
    const filename = request.params.filename
    const directory = process.argv[3]
    if (!filename || !directory) {
        return response.setStatus(500, "Internal error")
    }

    const pathToFile = `${directory}${filename}`
    const hasRegisteredFile = await checkFile(pathToFile)
    if (!hasRegisteredFile) {
        return response.setStatus(404, "Not Found")
    }

    const fileContent = await readFile(pathToFile, 'utf8')

    response.setContentType('application/octet-stream')
        .setBody(fileContent)
}

export async function registerFile({ request, response }: Context) {
    const filename = request.params.filename
    const directory = process.argv[3]
    if (!filename || !directory) {
        return response.setStatus(500, "Not Found")
    }

    const content = request.body
    if (content === null || content === "") {
        return response.setStatus(422, "Missing body")
    }

    const pathToFile = `${directory}${filename}`
    console.log({ content, pathToFile })

    await writeFile(pathToFile, content)
}
