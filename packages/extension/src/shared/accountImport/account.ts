import type { Address } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import type {
  AccountInterface,
  CairoVersion,
  ProviderInterface,
  Signature,
  TypedData,
} from "starknet"
import { PrivateKeySigner } from "../signer/PrivateKeySigner"
import { BaseStarknetAccount } from "../starknetAccount/base"
import type { BaseSignerInterface } from "../signer/BaseSignerInterface"

export class ImportedAccount extends BaseStarknetAccount {
  private static supportedSigners = [PrivateKeySigner]

  constructor(
    provider: ProviderInterface,
    address: Address,
    signer: PrivateKeySigner,
    cairoVersion: CairoVersion = "1",
    classHash: string | undefined,
  ) {
    super(provider, address, signer, cairoVersion, classHash)
    this.signer = signer
  }

  public static fromAccount(
    account: AccountInterface,
    signer: BaseSignerInterface,
    classHash: string | undefined,
  ) {
    if (!this.isValidSigner(signer)) {
      throw new Error(
        "Unsupported signer for ImportedAccount: " + signer.signerType,
      )
    }
    const address = addressSchema.parse(account.address)

    return new ImportedAccount(
      account,
      address,
      signer,
      account.cairoVersion,
      classHash,
    )
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.signer.signMessage(typedData, this.address)
  }

  public static isValidSigner(
    signer: BaseSignerInterface,
  ): signer is PrivateKeySigner {
    return this.supportedSigners.some((supportedSigner) =>
      supportedSigner.isValid(signer),
    )
  }
}
