import type { Signature } from "starknet"
import { Signer, encode, num } from "starknet"
import { HDKey } from "@scure/bip32"
import { hexToBytes } from "@noble/curves/abstract/utils"
import { grindKey } from "./utils"
import type { BaseSignerInterface } from "./BaseSignerInterface"
import { SignerType } from "../wallet.model"
import type { PublicKeyWithIndex } from "./types"
import { isString } from "lodash-es"
import { getStarkKey } from "micro-starknet"

export class ArgentSigner extends Signer implements BaseSignerInterface {
  signerType: SignerType
  derivationPath: string
  constructor(secret: string, derivationPath: string) {
    const hex = encode.removeHexPrefix(num.toHex(secret))
    // Bytes must be a multiple of 2 and default is multiple of 8
    // sanitizeHex should not be used because of leading 0x
    const sanitized = encode.sanitizeBytes(hex, 2)
    const masterNode = HDKey.fromMasterSeed(hexToBytes(sanitized))
    const childNode = masterNode.derive(derivationPath)

    if (!childNode.privateKey) {
      throw "childNode.privateKey is undefined"
    }

    const groundKey = grindKey(childNode.privateKey)
    super(encode.sanitizeHex(groundKey))
    this.signerType = SignerType.LOCAL_SECRET
    this.derivationPath = derivationPath
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

  public static isValid(signer: BaseSignerInterface): signer is ArgentSigner {
    return signer.signerType === SignerType.LOCAL_SECRET
  }

  public static generatePublicKeys(
    secret: string,
    start: number,
    numberOfPairs: number,
    baseDerivationPath: string,
  ): PublicKeyWithIndex[] {
    const pubKeys: PublicKeyWithIndex[] = []
    for (let index = start; index < start + numberOfPairs; index++) {
      const derivationPath = `${baseDerivationPath}/${index}`
      pubKeys.push({
        pubKey: new ArgentSigner(secret, derivationPath).getStarkKey(),
        index,
      })
    }

    return pubKeys
  }
}
