import { stringToBytes } from "@scure/base"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import { ec, encode } from "starknet"

import { ShieldMessage } from "../shared/messages/ShieldMessage"
import { addAccount, getAccounts } from "../shared/shield/backend/account"
import { ARGENT_SHIELD_ENABLED } from "../shared/shield/constants"
import { isEqualAddress } from "../ui/services/addresses"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleShieldMessage: HandleMessage<ShieldMessage> = async ({
  msg,
  background: { wallet },
}) => {
  switch (msg.type) {
    case "SHIELD_MAYBE_ADD_ACCOUNT": {
      if (!ARGENT_SHIELD_ENABLED) {
        /** should never happen */
        throw "Argent Shield is not enabled"
      }
      /** Check if account exists in backend and add it if not */
      try {
        const selectedAccount = await wallet.getSelectedAccount()
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        if (!starknetAccount || !selectedAccount) {
          throw Error("no accounts")
        }

        /** Check if this account already exists in backend */
        const accounts = await getAccounts()
        const existingAccount = accounts.find((x) =>
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
          type: "SHIELD_MAYBE_ADD_ACCOUNT_RES",
          data: {
            guardianAddress,
          },
        })
      } catch (error) {
        return sendMessageToUi({
          type: "SHIELD_MAYBE_ADD_ACCOUNT_REJ",
          data: `${error}`,
        })
      }
    }
  }

  throw new UnhandledMessage()
}
