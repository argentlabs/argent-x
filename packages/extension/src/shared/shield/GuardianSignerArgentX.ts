import { GuardianSigner } from "@argent/guardian"
import type { CosignerMessage } from "@argent/guardian"
import type { Signature } from "starknet"
import { number } from "starknet"

import { getVerifiedEmailIsExpired } from "./verifiedEmail"

export class GuardianSignerArgentX extends GuardianSigner {
  public async cosignMessage(
    cosignerMessage: CosignerMessage,
  ): Promise<Signature> {
    const verifiedEmailIsExpired = await getVerifiedEmailIsExpired()

    if (verifiedEmailIsExpired) {
      throw new Error("Email verification expired")
    }

    const response = await this.cosigner(cosignerMessage)

    const signature = [
      number.toBN(response.signature.r).toString(),
      number.toBN(response.signature.s).toString(),
    ]

    return signature
  }
}
