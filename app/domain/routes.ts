import { Router } from "../framework/router/router"

import { index, echoRoute, echoUserAgent, readFileIfExist, registerFile } from "./domain"

const router = Router.getInstance()

router.get("/", index)
router.get("/echo/:label", echoRoute)
router.get("/user-agent", echoUserAgent)
router.get("/files/:filename", readFileIfExist)
router.post("/files/:filename", registerFile)
