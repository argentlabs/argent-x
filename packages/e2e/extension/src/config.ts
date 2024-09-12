import path from "path"
import dotenv from "dotenv"
import fs from "fs"
import commonConfig from "../../shared/config"

const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const extensionHydrogenConfig = {
  ...commonConfig,
  testSeed1: process.env.E2E_TESTNET_SEED1, //wallet with 33 regular deployed accounts and 1 multisig deployed account
  testSeed3: process.env.E2E_TESTNET_SEED3, //wallet with 1 deployed account, and multisig with removed user
  testSeed4: process.env.E2E_TESTNET_SEED4, //wallet with non deployed account but with funds
  senderSeed: process.env.E2E_SENDER_SEED,
  account1Seed2: process.env.E2E_ACCOUNT_1_SEED2,
  spokCampaignName: process.env.E2E_SPOK_CAMPAIGN_NAME,
  spokCampaignUrl: process.env.E2E_SPOK_CAMPAIGN_URL,
  guardianEmail: process.env.E2E_GUARDIAN_EMAIL,
  useStrkAsFeeToken: process.env.E2E_USE_STRK_AS_FEE_TOKEN,
  skipTXTests: process.env.E2E_SKIP_TX_TESTS,
}

const extensionProdConfig = {
  ...commonConfig,
  testSeed1: process.env.E2E_MAINNET_SEED1,
  testSeed3: "",
  testSeed4: "",
  senderSeed: process.env.E2E_SENDER_SEED,
  account1Seed2: "",
  account1Seed3: "",
  spokCampaignName: "",
  spokCampaignUrl: "",
  guardianEmail: "",
  useStrkAsFeeToken: "false",
  skipTXTests: "true",
}

const config = commonConfig.isProdTesting
  ? extensionProdConfig
  : extensionHydrogenConfig
// check that no value of config is undefined, otherwise throw error
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing ${key} config variable; check .env file`)
  }
})
export default config
