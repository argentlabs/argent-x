import path from "path"
import dotenv from "dotenv"
import fs from "fs"

const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const commonConfig = {
  isProdTesting: process.env.ARGENT_X_ENVIRONMENT === "prod" ? true : false,
  password: "MyP@ss3!",
  //slack
  slackToken: process.env.SLACK_TOKEN,
  slackChannelId: process.env.SLACK_CHANNEL_ID,
  //accounts used for setup
  senderAddrs: process.env.E2E_SENDER_ADDRESSES?.split(","),
  senderKeys: process.env.E2E_SENDER_PRIVATEKEYS?.split(","),
  destinationAddress: process.env.E2E_SENDER_ADDRESSES?.split(",")[0], //used as transfers destination
  // urls
  rpcUrl: process.env.ARGENT_SEPOLIA_RPC_URL,
  beAPIUrl:
    process.env.ARGENT_X_ENVIRONMENT === "prod"
      ? ""
      : process.env.ARGENT_API_BASE_URL,
}

// check that no value of config is undefined, otherwise throw error
Object.entries(commonConfig).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing ${key} config variable; check .env file`)
  }
})

export default commonConfig
