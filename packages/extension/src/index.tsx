import React, { StrictMode } from "react"
import * as ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"

import App from "./app/App"

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById("root"),
)
