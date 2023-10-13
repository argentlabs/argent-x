import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import {
  ARGENT_API_ENABLED,
  ARGENT_TRANSACTION_REVIEW_API_ENABLED,
} from "../shared/api/constants"
import { App } from "./App"
import { clientUIService } from "./services/ui"

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
if (!ARGENT_TRANSACTION_REVIEW_API_ENABLED && isDev) {
  console.warn(
    "process.env.ARGENT_TRANSACTION_REVIEW_API_BASE_URL is not defined or invalid in .env file or environment - transaction review API calls will not be made",
  )
}

clientUIService.registerUIProcess()

const root = createRoot(container)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
