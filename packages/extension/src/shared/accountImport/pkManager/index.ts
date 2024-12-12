import { PKManager } from "./PKManager"
import { pkStore } from "./storage"

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest

// SCRYPT_N is set to 262144 in WalletSingleton.ts for unlocking the wallet, a highly sensitive operation.
// A higher SCRYPT_N value increases the time to unlock the wallet, enhancing security by making brute-force attacks more difficult.
// In contrast, SCRYPT_N is set to 16384 in PKManager for storing and retrieving encrypted private keys.
// This lower value is chosen because accessing encrypted private keys requires the wallet to be already unlocked.
// The value 16384 is chosen to balance security and performance for key storage operations.
const SCRYPT_N = isDevOrTest ? 64 : 16384
export const pkManager = new PKManager(pkStore, SCRYPT_N)
