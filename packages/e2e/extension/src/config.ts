import path from "path"
import dotenv from "dotenv"
import fs from "fs"

const envPath = path.resolve(__dirname, "../../.env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const config = {
  password: "MyP@ss3!",
  artifactsDir: path.resolve(__dirname, "../../artifacts/playwright"),
  reportsDir: path.resolve(__dirname, "../../artifacts/reports"),
  distDir: path.join(__dirname, "../../../extension/dist/"),
  testNetSeed1: process.env.E2E_TESTNET_SEED1, //wallet with 32 deployed accounts
  testNetSeed2: process.env.E2E_TESTNET_SEED2, //wallet with 1 deployed account
  testNetSeed3: process.env.E2E_TESTNET_SEED3, //wallet with 1 deployed account
  destinationAddress: process.env.E2E_SENDER_ADDRESS, //used as transfers destination
  senderAddr: process.env.E2E_SENDER_ADDRESS,
  senderSeed: process.env.E2E_SENDER_SEED,
  senderKey: process.env.E2E_SENDER_PRIVATEKEY,
  account1Seed2: process.env.E2E_ACCOUNT_1_SEED2,
  account1Seed3: process.env.E2E_ACCOUNT_1_SEED3,
  starknetTestNetUrl: process.env.STARKNET_TESTNET_URL,
  starkscanTestNetUrl: process.env.STARKSCAN_TESTNET_URL,
  testnetRpcUrl: process.env.ARGENT_TESTNET_RPC_URL,
}

// check that no value of config is undefined, otherwise throw error
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing ${key} config variable; check .env file`)
  }
})

export default config
