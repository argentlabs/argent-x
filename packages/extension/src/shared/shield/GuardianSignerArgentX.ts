import { CosignerOffchainMessage, GuardianSigner } from "@argent/guardian"
import type { CosignerMessage } from "@argent/guardian"
import { Signature, hash } from "starknet"
import { number } from "starknet"

import { isEqualAddress } from "../../ui/services/addresses"
import { isTokenExpired } from "./backend/account"

/**
 * 'Escape' entrypoints that can be used when guardian is assigned, but without cosigner
 */
export const guardianSignerNotRequired = [
  "escapeGuardian",
  "triggerEscapeGuardian",
]

export const guardianSignerNotRequiredSelectors = guardianSignerNotRequired.map(
  (entrypoint) => hash.getSelectorFromName(entrypoint),
)

export class GuardianSignerArgentX extends GuardianSigner {
  public async cosignMessage(
    cosignerMessage: CosignerMessage | CosignerOffchainMessage,
    isOffchainMessage = false,
  ): Promise<Signature> {
    /** special case - check guardianSignerNotRequired */
    const selector = cosignerMessage.message?.calldata?.[2]

    if (
      guardianSignerNotRequiredSelectors.find((notRequiredSelector) =>
        isEqualAddress(notRequiredSelector, selector),
      )
    ) {
      return []
    }

    const tokenExpired = await isTokenExpired()

    if (tokenExpired) {
      throw new Error("Argent Shield token is expired")
    }

    const response = await this.cosigner(cosignerMessage, isOffchainMessage)

    const signature = [
      number.toBN(response.signature.r).toString(),
      number.toBN(response.signature.s).toString(),
    ]

    return signature
  }
}
