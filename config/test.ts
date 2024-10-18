import { configure, processCLIArgs, run } from '@japa/runner'
import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import { fileSystem } from '@japa/file-system'

import { SERVER_HOSTNAME, SERVER_PORT } from "../app/server"

processCLIArgs(process.argv.splice(2))
configure({
    files: ["app/**/*.spec.ts"],
    plugins: [
        assert(),
        apiClient(`http://${SERVER_HOSTNAME}:${SERVER_PORT}`),
        fileSystem({
            basePath: new URL('../files', import.meta.url),
            autoClean: true,
        }),
    ],
})

run()