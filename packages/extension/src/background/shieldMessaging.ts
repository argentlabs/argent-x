import { stringToBytes } from "@scure/base"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import { ec, encode } from "starknet"

import {
  getNetworkSelector,
  withGuardianSelector,
} from "../shared/account/selectors"
import { getAccounts } from "../shared/account/store"
import { ShieldMessage } from "../shared/messages/ShieldMessage"
import {
  addAccount,
  getAccounts as getBackendAccounts,
} from "../shared/shield/backend/account"
import {
  ARGENT_SHIELD_ENABLED,
  ARGENT_SHIELD_ERROR_EMAIL_IN_USE,
  ARGENT_SHIELD_ERROR_WRONG_EMAIL,
  ARGENT_SHIELD_NETWORK_ID,
} from "../shared/shield/constants"
import { isEqualAddress } from "../ui/services/addresses"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleShieldMessage: HandleMessage<ShieldMessage> = async ({
  msg,
  background: { wallet },
}) => {
  switch (msg.type) {
    case "SHIELD_VALIDATE_ACCOUNT": {
      if (!ARGENT_SHIELD_ENABLED) {
        /** should never happen */
        throw new Error("Argent Shield is not enabled")
      }

      /** Check if account is valid for current wallet and exists in backend */
      try {
        const selectedAccount = await wallet.getSelectedAccount()
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        if (!starknetAccount || !selectedAccount) {
          throw Error("no accounts")
        }

        const backendAccounts = await getBackendAccounts()

        if (backendAccounts.length && ARGENT_SHIELD_NETWORK_ID) {
          /**
           * Validate that this email was used for existing local and backend accounts
           * - check if existing accounts in backend match local accounts
           * - if not then must use different email
           * */
          const accountsOnNetwork = await getAccounts(
            getNetworkSelector(ARGENT_SHIELD_NETWORK_ID),
          )
          console.log({ accountsOnNetwork })
          let backendAccountMatches = false
          for (const backendAccount of backendAccounts) {
            try {
              const existingAccount = accountsOnNetwork.find((account) =>
                isEqualAddress(account.address, backendAccount.address),
              )
              if (existingAccount) {
                backendAccountMatches = true
                break
              }
            } catch {
              // ignore 'not found' exception
            }
          }
          if (!backendAccountMatches) {
            throw new Error(ARGENT_SHIELD_ERROR_EMAIL_IN_USE)
          }
        }

        if (!backendAccounts.length) {
          /**
           * Validate that this email was used for existing local 2FA accounts
           * - no backend accounts for this email
           * - we already have > 0 accounts with guardian assigned
           * - therefore must have used a different email for those
           */
          const accountsWithGuardian = await getAccounts(withGuardianSelector)
          if (accountsWithGuardian.length) {
            throw new Error(ARGENT_SHIELD_ERROR_WRONG_EMAIL)
          }
        }

        /** Check if this account already exists in backend */

        const existingAccount = backendAccounts.find((x) =>
          isEqualAddress(x.address, selectedAccount.address),
        )

        let guardianAddress: string | undefined

        if (existingAccount) {
          guardianAddress = existingAccount.guardianAddresses[0]
        } else {
          /** Add account to backend */
          const keyPair = await wallet.getKeyPairByDerivationPath(
            selectedAccount?.signer.derivationPath,
          )
          const privateKey = keyPair.getPrivate()
          const publicKey = ec.getStarkKey(keyPair)
          const privateKeyHex = encode.addHexPrefix(privateKey.toString(16))

          const deploySignature = sign(
            pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
            privateKeyHex,
          )

          const { r, s } = Signature.fromHex(deploySignature)
          const response = await addAccount(
            publicKey,
            selectedAccount.address,
            [
              encode.addHexPrefix(r.toString(16)),
              encode.addHexPrefix(s.toString(16)),
            ],
          )
          guardianAddress = response.guardianAddress
        }
        if (!guardianAddress) {
          throw new Error("Unable to add account")
        }
        return sendMessageToUi({
          type: "SHIELD_VALIDATE_ACCOUNT_RES",
          data: {
            guardianAddress,
          },
        })
      } catch (error) {
        return sendMessageToUi({
          type: "SHIELD_VALIDATE_ACCOUNT_REJ",
          data: `${error}`,
        })
      }
    }
  }

  throw new UnhandledMessage()
}
