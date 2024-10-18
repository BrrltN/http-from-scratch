import { test } from "@japa/runner"
import { start, close } from "../server"

test.group("DOMAIN GET /", (group) => {
    group.each.setup(() => {
        start()
        return () => close()
    })
    test("Return an hello world", async ({ client, assert }) => {
        const response = await client.get('/')

        response.assertStatus(200)
        assert.equal(response.text(), "Hello World")
    })
})

test.group("DOMAIN GET /echo", (group) => {
    group.each.setup(() => {
        start()
        return () => close()
    })
    test("Respond a 404 when the URL parameter is missing", async ({ client }) => {
        const response = await client.get('/echo')

        response.assertStatus(404)
    })
    test("Respond the URL parameter provided", async ({ client, assert }) => {
        const urlParameter = "orphee"
        const response = await client.get(`/echo/${urlParameter}`)

        response.assertStatus(200)
        assert.equal(response.text(), urlParameter)
    })
})

test.group("DOMAIN GET /userAgent", (group) => {
    group.each.setup(() => {
        start()
        return () => close()
    })
    test("Respond a default response when user-agent header is missing", async ({ client, assert }) => {
        const response = await client.get("/user-agent").header("User-Agent", "")

        response.assertStatus(200)
        assert.equal(response.text(), "No User-Agent")
    })
    test("Respond the user-agent provided", async ({ client, assert }) => {
        const userAgent = "test-runner"
        const response = await client.get("/user-agent").header("User-Agent", userAgent)

        response.assertStatus(200)
        assert.equal(response.text(), userAgent)
    })
})

test.group("DOMAIN GET /files", (group) => {
    group.each.setup(() => {
        start()
        return () => close()
    })
    test("Respond a 404 when file name URL parameter is missing", async ({ client }) => {
        const response = await client.get('/files')

        response.assertStatus(404)
    })
    test("Respond the file content as Buffer when file exist", async ({ client, assert, fs }) => {
        const fileName = "SuperFilePointCom"
        const content = "I'm supa man"
        await fs.create(fileName, content)

        const response = await client.get(`/files/${fileName}`)
        const body = response.body()

        response.assertStatus(200)

        assert.isTrue(Buffer.isBuffer(body))
        assert.equal(body.toString(), content)
    })
    test("Respond a 404 when file don't exist", async ({ client }) => {
        const response = await client.get("/files/random")

        response.assertStatus(404)
    })
})

test.group("DOMAIN POST /files", (group) => {
    group.each.setup(() => {
        start()
        return () => close()
    })
    test("Respond a 404 when file name URL parameter is missing", async ({ client }) => {
        const response = await client.post('/files').type("text/plain")

        response.assertStatus(404)
    })
    test("Respond a 422 if body is empty", async ({ client }) => {
        const response = await client.post('/files/toto').type("text/plain")

        response.assertStatus(422)
    })
    test("Respond a 201 after create a file from the body and URL parameter", async ({ client, assert }) => {
        const filename = "js-sucks"
        const content = "but still use it"
        const request = client.post(`/files/${filename}`).type("text/plain")
        // hacky : passage par l'objet SuperAgent pour définir un raw body qui n'est pas un json / form etc
        request.request.send(content)

        const response = await request

        response.assertStatus(201)
        await assert.fileExists(filename)
        await assert.fileEquals(filename, content)
    })
})