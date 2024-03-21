import { GuardianSigner } from "@argent/guardian"
import type { CosignerMessage, CosignerOffchainMessage } from "@argent/guardian"
import { Signature, hash, num } from "starknet6"
import { isEqualAddress } from "@argent/x-shared"

import { isTokenExpired } from "./backend/account"

/**
 * 'Escape' entrypoints that can be used when guardian is assigned, but without cosigner
 */
export const guardianSignerNotRequired = [
  "escapeGuardian",
  "triggerEscapeGuardian",
  "escape_guardian",
  "trigger_escape_guardian",
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
    if (
      "type" in cosignerMessage &&
      (cosignerMessage.type === "starknet" ||
        cosignerMessage.type === "starknetV3") &&
      guardianSignerNotRequiredSelectors.find((notRequiredSelector) =>
        isEqualAddress(
          notRequiredSelector,
          cosignerMessage.message.calldata[2], // calldata[2] is the selector
        ),
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
      num.toBigInt(response.signature.r).toString(),
      num.toBigInt(response.signature.s).toString(),
    ]

    return signature
  }
}
