import fs from "fs"
import path from "path"
const fastify = require("fastify")

interface HAREntry {
  request: {
    method: string
    url: string
    postData?: { text: string }
  }
  response: {
    status: number
    headers: Array<{ name: string; value: string }>
    content: {
      text?: string
      encoding?: string
    }
  }
}

export default class HARServer {
  private config: { port: number; useRegex: boolean }
  private app: any
  private entries: HAREntry[]

  constructor(config: Partial<{ port: number; useRegex: boolean }> = {}) {
    this.config = {
      port: parseInt(process.env.PORT || "3333", 10),
      useRegex: false,
      ...config,
    }
    this.app = fastify({ logger: false })
    this.entries = []
  }

  async initialize() {
    this.app.addContentTypeParser(
      "*",
      { parseAs: "string" },
      async (_req: any, body: string) => {
        try {
          return body.length > 0 ? JSON.parse(body) : {}
        } catch {
          return body
        }
      },
    )

    this.app.addHook("onRequest", async (request: any, reply: any) => {
      reply.header("Access-Control-Allow-Origin", "*")
      reply.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      )
      reply.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      )

      if (request.method === "OPTIONS") {
        reply.send()
        return
      }
    })

    this.app.route({
      method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      url: "/*",
      handler: this.handleRequest.bind(this),
    })
  }

  async handleRequest(request: any, reply: any) {
    const entry = this.findMatchingEntry(request)
    if (!entry) {
      throw this.app.httpErrors.notFound("Endpoint not found in HAR")
    }
    return this.sendResponse(entry, reply)
  }

  async isServerRunning() {
    try {
      await fetch(`http://localhost:${this.config.port}/health`)
      return true
    } catch {
      return false
    }
  }

  async sendResponse(entry: HAREntry, reply: any) {
    const safeHeaders = this.filterHeaders(entry.response.headers)
    safeHeaders.forEach((header: { name: string; value: string }) =>
      reply.header(header.name, header.value),
    )
    reply.code(entry.response.status)
    if (!entry.response.content.text) {
      return ""
    }
    return entry.response.content.encoding === "base64"
      ? Buffer.from(entry.response.content.text, "base64")
      : entry.response.content.text
  }

  filterHeaders(headers: Array<{ name: string; value: string }>) {
    const excludedHeaders = new Set([
      "content-length",
      "content-encoding",
      "transfer-encoding",
    ])
    return headers.filter(
      (header) => !excludedHeaders.has(header.name.toLowerCase()),
    )
  }

  isBodyMatch(entry: HAREntry, requestBody: any) {
    if (!entry.request.postData) {
      return true
    }
    try {
      const entryBody = JSON.parse(entry.request.postData.text)
      return JSON.stringify(entryBody) === JSON.stringify(requestBody)
    } catch {
      return entry.request.postData.text === JSON.stringify(requestBody)
    }
  }

  findMatchingEntry(req: any) {
    const requestUrl = new URL(req.url, `http://localhost:${this.config.port}`)
    return this.entries.find((entry) => {
      const entryUrl = new URL(entry.request.url)
      const methodMatches = entry.request.method === req.method
      const urlMatches = this.config.useRegex
        ? new RegExp(entryUrl.pathname).test(requestUrl.pathname)
        : entryUrl.pathname === requestUrl.pathname
      return methodMatches && urlMatches && this.isBodyMatch(entry, req.body)
    })
  }

  async loadHARFile(filePath: string) {
    const fullPath = path.resolve(process.cwd(), "performance", filePath)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Path does not exist: ${fullPath}`)
    }
    const stats = fs.statSync(fullPath)
    const harPath = stats.isDirectory()
      ? this.findLatestHARFile(fullPath)
      : fullPath
    if (!harPath) {
      throw new Error("No HAR files found in the specified directory")
    }
    const fileContent = await fs.promises.readFile(harPath, "utf8")
    const harData = JSON.parse(fileContent)
    if (!harData.log?.entries) {
      throw new Error("Invalid HAR file format: missing log.entries")
    }
    this.entries = harData.log.entries
    console.log(`Loaded ${this.entries.length} entries from ${harPath}`)
  }

  findLatestHARFile(dirPath: string) {
    const harFiles = fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith(".har"))
      .map((file) => ({
        name: file,
        path: path.join(dirPath, file),
        mtime: fs.statSync(path.join(dirPath, file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    return harFiles.length > 0 ? harFiles[0].path : null
  }

  async start(harPath: string, useRegex = false) {
    try {
      await this.initialize()
      this.config.useRegex = useRegex
      await this.loadHARFile(harPath)
      await this.app.listen({ port: this.config.port, host: "127.0.0.1" })
      console.log(`HAR server running at http://localhost:${this.config.port}`)
    } catch (error) {
      console.error("Failed to start server:", error)
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }
      throw error
    }
  }

  async stop() {
    await this.app.close()
    console.log("HAR server stopped")
  }

  async reload(harPath: string, useRegex = false) {
    const isRunning = await this.isServerRunning()
    if (!isRunning) {
      await this.start(harPath, useRegex)
      return
    }
    try {
      this.config.useRegex = useRegex
      await this.loadHARFile(harPath)
      console.log(`HAR file reloaded from ${harPath}`)
    } catch (error) {
      console.error("Failed to reload HAR file:", error)
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }
      throw error
    }
  }
}
