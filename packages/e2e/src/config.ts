import path from "path"
import dotenv from "dotenv"
import fs from "fs"

const envPath = path.resolve(__dirname, "../.env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const commonConfig = {
  isProdTesting: process.env.ARGENT_X_ENVIRONMENT === "prod" ? true : false,
  password: process.env.E2E_EXTENSION_PASSWORD || "",
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
  viewportSize: { width: 360, height: 800 },
  artifactsDir: path.resolve(__dirname, "../artifacts/playwright"),
  isCI: Boolean(process.env.CI),
  migDir: path.join(__dirname, "../../e2e/mig/"),
  distDir: path.join(__dirname, "../../extension/dist/"),
  migVersionDir: path.join(__dirname, "../../e2e/mig/dist"),
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
  accountsToImport: process.env.E2E_ACCOUNTS_TO_IMPORT,
  accountToImportAndTx: process.env.E2E_ACCOUNT_TO_IMPORT_AND_TX?.split(","),
  qaUtilsURL: process.env.E2E_QA_UTILS_URL,
  qaUtilsAuthToken: process.env.E2E_QA_UTILS_AUTH_TOKEN,
  initialBalanceMultiplier: process.env.INITIAL_BALANCE_MULTIPLIER || 1,
  migAccountAddress: process.env.E2E_MIG_ACCOUNT_ADDRESS,
  migVersions: process.env.E2E_MIG_VERSIONS,
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
  accountsToImport: "",
  accountToImportAndTx: "",
  qaUtilsURL: "",
  qaUtilsAuthToken: "",
  initialBalanceMultiplier: 1,
  migAccountAddress: "",
  migVersions: "",
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
