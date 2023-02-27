import { GuardianSigner } from "@argent/guardian"
import type { CosignerMessage } from "@argent/guardian"
import type { Signature } from "starknet"
import { number } from "starknet"

import { isTokenExpired } from "./backend/account"

export class GuardianSignerArgentX extends GuardianSigner {
  public async cosignMessage(
    cosignerMessage: CosignerMessage,
  ): Promise<Signature> {
    const tokenExpired = await isTokenExpired()

    if (tokenExpired) {
      throw new Error("Argent Shield token is expired")
    }

    const response = await this.cosigner(cosignerMessage)

    const signature = [
      number.toBN(response.signature.r).toString(),
      number.toBN(response.signature.s).toString(),
    ]

    return signature
  }
}
