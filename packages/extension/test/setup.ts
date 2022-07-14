import fetch from "cross-fetch"
import { vi } from "vitest"

vi.stubGlobal("fetch", fetch)
vi.stubGlobal("chrome", {
  runtime: {
    id: "test",
  },
})
