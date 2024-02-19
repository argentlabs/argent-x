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
    email: "testuser@mail.com",
    pin: "1111111",
    password: "myNewPass12!",
  },
  url: "http://localhost:3005",
}

// check that no value of config is undefined, otherwise throw error
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing ${key} config variable; check .env file`)
  }
})

export default config
