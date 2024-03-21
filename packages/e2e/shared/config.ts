import path from "path"
import dotenv from "dotenv"
import fs from "fs"

const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const config = {
  password: "MyP@ss3!",
  testNetSeed1: process.env.E2E_TESTNET_SEED1, //wallet with 32 deployed accounts
  testNetSeed2: process.env.E2E_TESTNET_SEED2, //wallet with 1 deployed account
  testNetSeed3: process.env.E2E_TESTNET_SEED3, //wallet with 1 deployed account
  testNetSeed4: process.env.E2E_TESTNET_SEED4, //wallet with non deployed account but with funds
  senderSeed: process.env.E2E_SENDER_SEED,
  account1Seed2: process.env.E2E_ACCOUNT_1_SEED2,
  account1Seed3: process.env.E2E_ACCOUNT_1_SEED3,
  starknetTestNetUrl: process.env.STARKNET_TESTNET_URL,
  starkscanTestNetUrl: process.env.STARKSCAN_TESTNET_URL,
  testnetRpcUrl: process.env.ARGENT_TESTNET_RPC_URL,
  senderAddrs: process.env.E2E_SENDER_ADDRESSES?.split(","),
  senderKeys: process.env.E2E_SENDER_PRIVATEKEYS?.split(","),
  destinationAddress: process.env.E2E_SENDER_ADDRESSES?.split(",")[0], //used as transfers destination
  spokCampaignName: process.env.E2E_SPOK_CAMPAIGN_NAME,
  spokCampaignUrl: process.env.E2E_SPOK_CAMPAIGN_URL,

  //webwallet
  validLogin: {
    email: process.env.WW_EMAIL!,
    pin: process.env.WW_PIN!,
    password: process.env.WW_LOGIN_PASSWORD!,
  },
  url: "http://localhost:3005",
  //slack
  slackToken: process.env.SLACK_TOKEN,
  slackChannelId: process.env.SLACK_CHANNEL_ID,
}

// check that no value of config is undefined, otherwise throw error
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing ${key} config variable; check .env file`)
  }
})

export default config
