import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { App } from "./App"

const container = document.getElementById("root")

if (!container) {
  throw new Error("No root element found")
}

const isDev = process.env.NODE_ENV === "development"
if (!process.env.REACT_APP_ARGENT_API_BASE_URL && isDev) {
  console.warn(
    "process.env.REACT_APP_ARGENT_API_BASE_URL is not defined in .env file or environment - API calls will fail",
  )
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
