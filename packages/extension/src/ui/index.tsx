import { lazy, StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { ARGENT_API_ENABLED } from "../shared/api/constants"
import { clientUIService } from "./services/ui"

// lazy allows the popup to open instantly
const App = lazy(() =>
  import("./App").then((module) => ({ default: module.App })),
)

const container = document.getElementById("root")

if (!container) {
  throw new Error("No root element found")
}

const isDev = process.env.NODE_ENV === "development"
if (!ARGENT_API_ENABLED && isDev) {
  console.warn(
    "process.env.ARGENT_API_BASE_URL is not defined or invalid in .env file or environment - API calls will not be made",
  )
}

clientUIService.registerUIProcess()

const root = createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
