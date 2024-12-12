import type { Signature } from "starknet"
import { SignerInterface } from "starknet"

export abstract class BaseSignerInterface extends SignerInterface {
  abstract signerType: string
  abstract signRawMsgHash(msgHash: string): Promise<Signature>
  abstract getPrivateKey(): string

  static isValid(_: BaseSignerInterface): boolean {
    throw new Error("To be implemented by subclasses")
  }
}
