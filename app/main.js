"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// app/server.ts
var import_node_net = __toESM(require("node:net"));

// app/framework/response/builder.ts
var ResponseBuidler = class {
  #separator = "\r\n";
  #startline = null;
  #contentType = null;
  #contentLength = null;
  #contentEncoding = null;
  #host = null;
  #userAgent = null;
  #body = null;
  #headers() {
    return [this.#startline, this.#contentType, this.#contentLength, this.#contentEncoding, this.#userAgent, this.#host];
  }
  #setContentLength() {
    if (!this.#body || this.#body.length === 0) {
      return;
    }
    const encoder = new TextEncoder();
    const encoded = encoder.encode(this.#body);
    this.#contentLength = `Content-Length: ${encoded.length.toString()}`;
  }
  setStatus(code, description) {
    this.#startline = `HTTP/1.1 ${code} ${description}`;
    return this;
  }
  setContentType(contentType) {
    this.#contentType = `Content-type: ${contentType}`;
    return this;
  }
  setUserAgent(userAgent) {
    this.#userAgent = `User-Agent: ${userAgent}`;
    return this;
  }
  setHost(host) {
    this.#host = `Host: ${host}`;
    return this;
  }
  setContentEncoding(contentEncoding) {
    this.#contentEncoding = `Content-Encoding: ${contentEncoding}`;
    return this;
  }
  setBody(data) {
    this.#body = data;
    this.#setContentLength();
    return this;
  }
  build() {
    if (!this.#startline || this.#startline.length === 0) {
      return { response: null, error: "Missing start line" };
    }
    if (this.#body) {
      if (!this.#contentLength) {
        return { response: null, error: "Missing content length header" };
      }
      if (!this.#contentType) {
        return { response: null, error: "Missing content type header" };
      }
    }
    const parsedHeaders = this.#headers().filter((item) => !!item).join(this.#separator) + this.#separator;
    const response2 = parsedHeaders + this.#separator + (this.#body || "");
    return { response: response2, error: null };
  }
};
var response = new ResponseBuidler();

// app/framework/response/standart.ts
function parseError(description) {
  const builder = new ResponseBuidler();
  const { response: response2, error } = builder.setStatus(400, description).build();
  return error === null ? response2 : error;
}
function timeout() {
  const builder = new ResponseBuidler();
  const { response: response2, error } = builder.setStatus(408, "Request Timeout").build();
  return error === null ? response2 : error;
}
function notFound() {
  const builder = new ResponseBuidler();
  const { response: response2, error } = builder.setStatus(404, "Not Found").build();
  console.log({ builder, notFound: response2 });
  return error === null ? response2 : error;
}

// app/framework/router/router.ts
var Router = class _Router {
  static #instance;
  #routeTree = /* @__PURE__ */ new Map();
  #paramKey = "__PARAMS__";
  #handlerKey = "__HANDLER__";
  constructor() {
  }
  // constructeur privé pour forcer le pattern singleton
  static getInstance() {
    if (!_Router.#instance) {
      _Router.#instance = new _Router();
    }
    return _Router.#instance;
  }
  #getOrCreateMethodTree(method) {
    const methodTree = this.#routeTree.get(method);
    if (methodTree) {
      return methodTree;
    }
    const createdMethodTree = /* @__PURE__ */ new Map();
    this.#routeTree.set(method, createdMethodTree);
    return createdMethodTree;
  }
  #getRouteSegments(path) {
    const routeSegments = path.split("/");
    const endsWithSeparator = routeSegments[routeSegments.length - 1] === "";
    if (routeSegments.length > 1 && endsWithSeparator) {
      routeSegments.pop();
    }
    return routeSegments;
  }
  #registerRoute(method, path, handler) {
    const methodTree = this.#getOrCreateMethodTree(method);
    const routeSegments = this.#getRouteSegments(path);
    let currentNode = methodTree;
    for (const [index2, routeNode] of routeSegments.entries()) {
      let getNextNode2 = function(node, key) {
        const nextNode = node.get(key);
        if (nextNode && typeof nextNode !== "function") {
          return nextNode;
        }
        return null;
      }, createEmptyNodeAndAddItToCurrentNode2 = function(node, key) {
        const emptyNode = /* @__PURE__ */ new Map();
        if (key.startsWith(":")) {
          key = key.substring(1);
        }
        node.set(key, emptyNode);
        return emptyNode;
      }, goToNextNode2 = function(current, nextNodeName) {
        const nextNode = getNextNode2(current, nextNodeName) || createEmptyNodeAndAddItToCurrentNode2(current, nextNodeName);
        return nextNode;
      };
      var getNextNode = getNextNode2, createEmptyNodeAndAddItToCurrentNode = createEmptyNodeAndAddItToCurrentNode2, goToNextNode = goToNextNode2;
      const isLastNode = index2 === routeSegments.length - 1;
      const isParam = routeNode.startsWith(":");
      if (isParam) {
        currentNode = goToNextNode2(currentNode, this.#paramKey);
      }
      currentNode = goToNextNode2(currentNode, routeNode);
      if (isLastNode) {
        currentNode.set(this.#handlerKey, handler);
      }
    }
  }
  getHandler(method, route) {
    const methodTree = this.#routeTree.get(method);
    if (!methodTree) {
      return { parsedHandler: null, error: "Method tree not found" };
    }
    const routeSegments = this.#getRouteSegments(route);
    let availableNodes = [{ node: methodTree, params: {} }];
    for (const routeSegment of routeSegments) {
      const segmentAvailableNodes = [];
      for (const currentNode of availableNodes) {
        if (currentNode.node === null) {
          continue;
        }
        const staticRouteNextNode = currentNode.node.get(routeSegment);
        const matchStaticRoute = staticRouteNextNode !== void 0;
        if (matchStaticRoute && typeof staticRouteNextNode !== "function") {
          segmentAvailableNodes.push({ node: staticRouteNextNode, params: currentNode.params });
          continue;
        }
        const parameterNode = currentNode.node.get(this.#paramKey);
        if (parameterNode === void 0 || typeof parameterNode === "function") {
          continue;
        }
        for (const [parameterName, node] of parameterNode.entries()) {
          if (typeof node === "function") {
            continue;
          }
          const params = { ...currentNode.params, [parameterName]: routeSegment };
          segmentAvailableNodes.push({ node, params });
        }
      }
      availableNodes = [...segmentAvailableNodes];
    }
    if (availableNodes.length !== 1) {
      return { parsedHandler: null, error: "Route match more than one handle" };
    }
    const availableNode = availableNodes[0];
    const handler = availableNode.node.get(this.#handlerKey);
    if (typeof handler !== "function") {
      return { parsedHandler: null, error: "Route don't have handler" };
    }
    const parsedHandler = { handler, params: availableNode.params };
    return { parsedHandler, error: null };
  }
  get(path, handler) {
    this.#registerRoute("GET", path, handler);
  }
  post(path, handler) {
    this.#registerRoute("POST", path, handler);
  }
};

// app/framework/error.ts
var REQUEST_ERRORS = {
  INCOMPLETE: { name: "incomplete", description: "Incomplete HTTP request" },
  PARSE: { name: "parse", description: "Invalid HTTP request" },
  MISSING_BODY_HEADERS: { name: "missing-body-headers", description: "Request should have content-type and content-length headers" }
};

// app/framework/request/startline.ts
function parseMethod(method) {
  if (method === "GET" || method === "POST") {
    return method;
  }
  return null;
}
function parseURI(input) {
  if (input === "*" || input.startsWith("/")) {
    return input;
  }
  return null;
}
function parseQueries(rawURI) {
  const queries = /* @__PURE__ */ new Map();
  const match = rawURI.match(/^([^?]*)(\?(.*))?$/);
  const hasQuery = match !== null && match[3] !== void 0;
  if (rawURI === "*" || !hasQuery) {
    return queries;
  }
  const rawQuery = match[3];
  for (const query of rawQuery.split("&")) {
    const [key, value] = query.split("=");
    if (!key || !value) {
      continue;
    }
    const currentQuery = queries.get(key);
    if (currentQuery !== void 0) {
      currentQuery.push(value);
      continue;
    }
    queries.set(key, [value]);
  }
  return queries;
}
function parseStartLine(partialRawRequest) {
  const lines = partialRawRequest.split("\r\n");
  if (lines.length < 3) {
    return { startline: null, error: REQUEST_ERRORS.INCOMPLETE };
  }
  const startLine = lines[0];
  const [rawMethod, rawURI, httpVersion] = startLine.split(/\s+/);
  const method = parseMethod(rawMethod);
  const URI = parseURI(rawURI);
  const isCorruptedStartline = httpVersion !== "HTTP/1.1" || !method || !URI;
  if (isCorruptedStartline) {
    return { startline: null, error: REQUEST_ERRORS.PARSE };
  }
  const queries = parseQueries(URI);
  return { startline: { method, URI, queries }, error: null };
}

// app/framework/type.ts
var TypedHeaderMap = class extends Map {
  set(key, value) {
    return super.set(key, value);
  }
  get(key) {
    return super.get(key);
  }
};

// app/framework/request/header.ts
function normalizeRawHeaderKeyValue(header) {
  const findKeyValueRegex = /([^:]*):\s*(.*)/;
  const match = header.match(findKeyValueRegex);
  if (match === null) {
    return null;
  }
  const key = match[1];
  let value = match[2];
  const beginWithSpaceRegex = /^\s/;
  if (beginWithSpaceRegex.test(value)) {
    value = value.slice(1);
  }
  return { key, value };
}
function parseRawContentLength(key, value) {
  const castedValue = Number(value.trim());
  if (key !== "Content-Length" || !Number.isInteger(castedValue)) {
    return null;
  }
  return { key: "contentLength", value: castedValue };
}
function parseRawContentType(key, value) {
  const isAvailableContentType = value === "text/plain" || value === "application/octet-stream";
  if (key !== "Content-Type" || !isAvailableContentType) {
    return null;
  }
  return { key: "contentType", value };
}
function parseRawUserAgent(key, value) {
  const isAvailableUserAgent = typeof value === "string";
  if (key !== "User-Agent" || !isAvailableUserAgent) {
    return null;
  }
  return { key: "userAgent", value };
}
function parseRawHost(key, value) {
  const isAvailableHost = typeof value === "string";
  if (key !== "Host" || !isAvailableHost) {
    return null;
  }
  return { key: "host", value };
}
function parseRawAcceptHeader(key, value) {
  if (key !== "Accept") {
    return null;
  }
  const acceptedMedias = [];
  const rawMedias = value.split(",");
  for (const media of rawMedias) {
    const [type, rawPriority] = media.trim().split(";");
    let priority = 1;
    if (rawPriority && rawPriority.startsWith("q=")) {
      priority = parseFloat(rawPriority.split("=")[1]);
    }
    acceptedMedias.push({ type: type.trim(), priority });
  }
  acceptedMedias.sort((a, b) => b.priority - a.priority);
  return { key: "accept", value: acceptedMedias };
}
function parseRawAcceptEncoding(key, value) {
  const isAcceptEncoding = value === "gzip";
  if (key !== "Accept-Encoding" || !isAcceptEncoding) {
    return null;
  }
  return { key: "acceptEncoding", value };
}
function parseHeaders(partialRawRequest) {
  const lines = partialRawRequest.split("\r\n");
  const endHeaderIndex = lines.findIndex((line) => line === "");
  const headers = new TypedHeaderMap();
  if (endHeaderIndex === -1) {
    return { headers: null, error: REQUEST_ERRORS.INCOMPLETE };
  }
  const rawHeaderLines = lines.slice(1, endHeaderIndex);
  for (const header of rawHeaderLines) {
    const normalizedRawHeader = normalizeRawHeaderKeyValue(header);
    if (!normalizedRawHeader) {
      continue;
    }
    const { key, value } = normalizedRawHeader;
    const contentLength = parseRawContentLength(key, value);
    if (contentLength) {
      headers.set(contentLength.key, contentLength.value);
    }
    const contentType = parseRawContentType(key, value);
    if (contentType) {
      headers.set(contentType.key, contentType.value);
    }
    const userAgent = parseRawUserAgent(key, value);
    if (userAgent) {
      headers.set(userAgent.key, userAgent.value);
    }
    const accept = parseRawAcceptHeader(key, value);
    if (accept) {
      headers.set(accept.key, accept.value);
    }
    const acceptEncoding = parseRawAcceptEncoding(key, value);
    if (acceptEncoding) {
      headers.set(acceptEncoding.key, acceptEncoding.value);
    }
    const host = parseRawHost(key, value);
    if (host) {
      headers.set(host.key, host.value);
    }
  }
  return { headers, error: null };
}

// app/framework/request/body.ts
function parseBody(method, headers, partialRawRequest) {
  if (method !== "POST") {
    return { body: null, error: null };
  }
  const contentType = headers.get("contentType");
  const contentLength = headers.get("contentLength");
  if (!contentType || !contentLength) {
    return { body: null, error: REQUEST_ERRORS.MISSING_BODY_HEADERS };
  }
  const lines = partialRawRequest.split("\r\n");
  const endHeaderIndex = lines.findIndex((line) => line === "");
  if (endHeaderIndex === -1) {
    return { body: null, error: REQUEST_ERRORS.INCOMPLETE };
  }
  const rawBodyLines = lines.slice(endHeaderIndex + 1);
  const rawBody = rawBodyLines.join();
  return { body: rawBody, error: null };
}

// app/framework/request/request.ts
function parseResquest(partialRawRequest) {
  const { startline, error: startLineError } = parseStartLine(partialRawRequest);
  if (startLineError !== null) {
    return { request: null, error: startLineError };
  }
  const { headers, error: headerError } = parseHeaders(partialRawRequest);
  if (headerError !== null) {
    return { request: null, error: headerError };
  }
  const { body, error: bodyError } = parseBody(startline.method, headers, partialRawRequest);
  if (bodyError) {
    return { request: null, error: bodyError };
  }
  return {
    request: {
      method: startline.method,
      URI: startline.URI,
      queries: startline.queries,
      params: {},
      headers,
      body
    },
    error: null
  };
}

// app/domain/domain.ts
var import_promises = require("fs/promises");
async function checkFile(pathToFile) {
  try {
    await (0, import_promises.access)(pathToFile);
    return true;
  } catch (err) {
    return false;
  }
}
async function index({ request, response: response2 }) {
  response2.setContentType("text/plain").setBody("Hello World");
}
async function echoRoute({ request, response: response2 }) {
  const search = request.params.label;
  if (search === void 0) {
    return;
  }
  response2.setContentType("text/plain").setBody(search);
}
async function echoUserAgent({ request, response: response2 }) {
  const userAgent = request.headers.get("userAgent") || "No User-Agent";
  response2.setContentType("text/plain").setBody(userAgent);
}
async function readFileIfExist({ request, response: response2 }) {
  const filename = request.params.filename;
  const directory = process.argv[3];
  if (!filename || !directory) {
    return response2.setStatus(500, "Internal error");
  }
  const pathToFile = `${directory}${filename}`;
  const hasRegisteredFile = await checkFile(pathToFile);
  if (!hasRegisteredFile) {
    return response2.setStatus(404, "Not Found");
  }
  const fileContent = await (0, import_promises.readFile)(pathToFile, "utf8");
  response2.setContentType("application/octet-stream").setBody(fileContent);
}
async function registerFile({ request, response: response2 }) {
  const filename = request.params.filename;
  const directory = process.argv[3];
  if (!filename || !directory) {
    return response2.setStatus(500, "Not Found");
  }
  const content = request.body;
  if (content === null || content === "") {
    return response2.setStatus(422, "Missing body");
  }
  const pathToFile = `${directory}${filename}`;
  console.log({ content, pathToFile });
  await (0, import_promises.writeFile)(pathToFile, content);
}

// app/domain/routes.ts
var router = Router.getInstance();
router.get("/", index);
router.get("/echo/:label", echoRoute);
router.get("/user-agent", echoUserAgent);
router.get("/files/:filename", readFileIfExist);
router.post("/files/:filename", registerFile);

// app/framework/app.ts
function getRouteHandler(request) {
  const path = request.URI;
  const method = request.method;
  const router2 = Router.getInstance();
  return router2.getHandler(method, path);
}
async function handleRequest(httpRequest) {
  const { request, error: requestParseError } = parseResquest(httpRequest);
  if (requestParseError !== null) {
    const isParseError = requestParseError.name !== "incomplete";
    return isParseError ? parseError(requestParseError.description) : null;
  }
  const { parsedHandler, error: routeError } = getRouteHandler(request);
  if (routeError !== null) {
    return notFound();
  }
  if (parsedHandler.params) {
    request.params = parsedHandler.params;
  }
  const builder = new ResponseBuidler();
  if (request.method === "GET") {
    builder.setStatus(200, "OK");
  }
  if (request.method === "POST") {
    builder.setStatus(201, "Created");
  }
  const requiredEncoding = request.headers.get("acceptEncoding");
  if (requiredEncoding) {
    builder.setContentEncoding(requiredEncoding);
  }
  const context = { request, response: builder };
  await parsedHandler.handler(context);
  const { response: response2, error } = builder.build();
  if (error !== null) {
    return parseError(error);
  }
  console.log({ response: response2 });
  return response2;
}

// app/server.ts
function enableTimeout(socket, time = 3e3) {
  socket.setTimeout(time);
  socket.on("timeout", () => {
    socket.end(timeout());
    socket.destroy();
  });
}
var server = import_node_net.default.createServer((socket) => {
  enableTimeout(socket);
  let httpRequest = "";
  socket.on("data", async (data) => {
    httpRequest += data.toString();
    const response2 = await handleRequest(httpRequest);
    if (response2 === null) {
      return;
    }
    socket.write(response2);
    return socket.end();
  });
  socket.on("error", () => {
    socket.end(parseError("server error"));
  });
});
server.listen(4221, "localhost");
