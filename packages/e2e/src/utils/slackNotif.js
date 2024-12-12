//@TODO move this to qa utils package
if (!Boolean(process.env.CI)) {
  const fs = require("fs")
  const path = require("path")
  const dotenv = require("dotenv")

  const envPath = path.resolve(__dirname, "../../.env")
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
}
const headers = {
  "Content-Type": "application/json",
  auth: process.env.E2E_QA_UTILS_AUTH_TOKEN || "",
}

const slackNotifyLowBalance = async () => {
  const requestOptions = {
    method: "GET",
    headers,
  }
  const request = `${process.env.E2E_QA_UTILS_URL}/api/notifyLowBalance`
  try {
    const response = await fetch(request, requestOptions)
    if (response.status !== 200) {
      console.error(await response.text())
      throw new Error(`Error notifying low balance`)
    }
    return response.status
  } catch (error) {
    console.error("Failed to notify low balance:", error)
    throw error
  }
}

slackNotifyLowBalance()
  .then((status) => console.log("Notification sent, status:", status))
  .catch((error) => console.error("Failed to send notification:", error))
