import { initAmplitude } from "../shared/analytics/init"

try {
  initAmplitude().catch((error) => {
    console.error("Error loading amplitude", error)
  })
} catch (e) {
  console.error("Error loading ampli", e)
}

try {
  // catch any errors from init.ts
  require("./init")
} catch (error) {
  console.error("Fatal exception in background/init.ts", error)
}
