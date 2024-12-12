import type { Signature } from "starknet"
import { encode, Signer } from "starknet"
import type { BaseSignerInterface } from "./BaseSignerInterface"
import { SignerType } from "../wallet.model"
import { getStarkKey } from "micro-starknet"
import { isString } from "lodash-es"

export class PrivateKeySigner extends Signer implements BaseSignerInterface {
  signerType: SignerType = SignerType.PRIVATE_KEY

  constructor(pk: string) {
    super(pk)
  }

  async getPubKey(): Promise<string> {
    return encode.sanitizeHex(await super.getPubKey())
  }

  /**
   * Get the stark key of the signer
   * This is same as getPublicKey, but it's not async
   */
  getStarkKey(): string {
    return encode.sanitizeHex(getStarkKey(this.pk))
  }

  getPrivateKey(): string {
    const pk = encode.removeHexPrefix(
      isString(this.pk) ? this.pk : encode.buf2hex(this.pk),
    )
    const paddedPk = encode.padLeft(pk, 64)
    return encode.addHexPrefix(paddedPk)
  }

  signRawMsgHash(msgHash: string): Promise<Signature> {
    return this.signRaw(msgHash)
  }

  public static isValid(
    signer: BaseSignerInterface,
  ): signer is PrivateKeySigner {
    return signer.signerType === SignerType.PRIVATE_KEY
  }
}
