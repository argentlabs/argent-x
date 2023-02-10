import { stringToBytes } from "@scure/base"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import { ec, encode, number } from "starknet"

import {
  getNetworkSelector,
  withGuardianSelector,
} from "../shared/account/selectors"
import { getAccounts } from "../shared/account/store"
import { ShieldMessage } from "../shared/messages/ShieldMessage"
import {
  addBackendAccount,
  getBackendAccounts,
} from "../shared/shield/backend/account"
import {
  ARGENT_SHIELD_ENABLED,
  ARGENT_SHIELD_NETWORK_ID,
} from "../shared/shield/constants"
import {
  checkForEmailInUse,
  checkForWrongEmail,
} from "../shared/shield/helpers"
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

      if (!ARGENT_SHIELD_NETWORK_ID) {
        /** should never happen */
        throw new Error("ARGENT_SHIELD_NETWORK_ID is not defined")
      }

      /** Check if account is valid for current wallet and exists in backend */
      try {
        const selectedAccount = await wallet.getSelectedAccount()
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        if (!starknetAccount || !selectedAccount) {
          throw Error("no accounts")
        }

        const backendAccounts = await getBackendAccounts()
        const accountsOnNetwork = await getAccounts(
          getNetworkSelector(ARGENT_SHIELD_NETWORK_ID),
        )
        const accountsWithGuardian = await getAccounts(withGuardianSelector)

        /** Validate email */

        checkForEmailInUse(backendAccounts, accountsOnNetwork)
        checkForWrongEmail(backendAccounts, accountsWithGuardian)

        /** Check if this account already exists in backend */

        const existingAccount = backendAccounts.find(
          (x) =>
            number.hexToDecimalString(x.address) ===
            number.hexToDecimalString(selectedAccount.address),
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
          const response = await addBackendAccount(
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
