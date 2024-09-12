import { CreateAccountType, SignerType } from "../wallet.model"

export const STANDARD_ARGENT_DERIVATION_PATH = "m/44'/9004'/0'/0"
export const MULTISIG_ARGENT_DERIVATION_PATH = "m/44'/9004'/1'/0"

export const STANDARD_LEDGER_DERIVATION_PATH =
  "m/2645'/1195502025'/1148870696'/0'/0'"

export const MULTISIG_LEDGER_DERIVATION_PATH =
  "m/2645'/1195502025'/1148870696'/1'/0'"

/**
 *
 * from https://community.starknet.io/t/account-keys-and-addresses-derivation-standard/1230
 *  m / purpose' / coin_type' / account' / change / address_index
 */
export const DERIVATION_PATHS: {
  [key in CreateAccountType]: { [key2 in SignerType]: string | null }
} = {
  standard: {
    local_secret: STANDARD_ARGENT_DERIVATION_PATH,
    ledger: STANDARD_LEDGER_DERIVATION_PATH,
  },
  multisig: {
    local_secret: MULTISIG_ARGENT_DERIVATION_PATH,
    ledger: MULTISIG_LEDGER_DERIVATION_PATH,
  },
  smart: {
    local_secret: STANDARD_ARGENT_DERIVATION_PATH,
    ledger: null,
  },
  standardCairo0: {
    local_secret: STANDARD_ARGENT_DERIVATION_PATH,
    ledger: null,
  },
}
