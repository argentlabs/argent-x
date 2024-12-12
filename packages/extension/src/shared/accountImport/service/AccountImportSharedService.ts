import type { Address, Hex } from "@argent/x-shared"
import {
  addressSchema,
  ETH_TOKEN_ADDRESS,
  hexSchema,
  STRK_TOKEN_ADDRESS,
  transferCalldataSchema,
} from "@argent/x-shared"
import { getProvider } from "../../network"
import type { INetworkService } from "../../network/service/INetworkService"
import { ImportedAccount } from "../account"
import type { IAccountImportSharedService } from "./IAccountImportSharedService"
import type { ProviderInterface } from "starknet"
import { CallData, constants, num, TransactionType, uint256 } from "starknet"
import { PrivateKeySigner } from "../../signer/PrivateKeySigner"
import type { ImportValidationResult, ValidatedImport } from "../types"
import { AccountImportError } from "../types"
import type { IPKManager } from "../pkManager/IPKManager"
import { getDerivationPathForIndex } from "../../signer/utils"
import type { WalletAccount } from "../../wallet.model"
import { SignerType } from "../../wallet.model"
import { getAccountIdentifier } from "../../utils/accountIdentifier"
import type { IAccountService } from "../../account/service/accountService/IAccountService"
import { ampli } from "../../analytics"
import type { TestnetAccountImportFailedProperties } from "../../../ampli"

export class AccountImportSharedService implements IAccountImportSharedService {
  constructor(
    public readonly accountService: IAccountService,
    public readonly networkService: Pick<INetworkService, "getById">,
    public readonly pkManager: IPKManager,
  ) {}

  async validateImport(
    address: Address,
    pk: Hex,
    networkId: string,
  ): Promise<ImportValidationResult> {
    const network = await this.networkService.getById(networkId)
    const provider = getProvider(network)

    let classHash: string
    let importedAccount: ImportedAccount
    let success = true
    let errorType: AccountImportError | undefined

    try {
      classHash = await provider.getClassHashAt(address)
    } catch {
      success = false
      errorType = AccountImportError.ACCOUNT_NOT_FOUND
      this.trackImportEvent({ success, errorType }, undefined)
      return { success, errorType }
    }

    try {
      importedAccount = this.buildAccount(provider, address, classHash, pk)
    } catch {
      success = false
      errorType = AccountImportError.INVALID_PK
      this.trackImportEvent({ success, errorType }, classHash)
      return { success, errorType }
    }

    if (await this.hasGuardianSigner(importedAccount)) {
      success = false
      errorType = AccountImportError.HAS_GUARDIAN
      this.trackImportEvent({ success, errorType }, classHash)
      return { success, errorType }
    }

    if (await this.isMultisigAccount(importedAccount)) {
      success = false
      errorType = AccountImportError.IS_MULTISIG
      this.trackImportEvent({ success, errorType }, classHash)
      return { success, errorType }
    }

    try {
      await this.validatePrivateKey(importedAccount)
    } catch {
      success = false
      errorType = AccountImportError.INVALID_PK
      this.trackImportEvent({ success, errorType }, classHash)
      return { success, errorType }
    }

    const result = {
      address,
      networkId,
      classHash: addressSchema.parse(classHash),
      pk,
    }

    this.trackImportEvent({ success, result }, classHash)

    return { success, result }
  }

  // Use 0x0 if the account doesn't exist and classhash can't be retrieved
  trackImportEvent(result: ImportValidationResult, classHash = "0x0") {
    if (result.success) {
      ampli.testnetAccountImportCompleted({
        "imported account class hash": classHash,
      })
    } else {
      let error: TestnetAccountImportFailedProperties["key import error"]
      switch (result.errorType) {
        case AccountImportError.ACCOUNT_NOT_FOUND:
          error = "account_not_found"
          break
        case AccountImportError.INVALID_PK:
          error = "invalid_key"
          break
        case AccountImportError.HAS_GUARDIAN:
          error = "has_guardian"
          break
        case AccountImportError.IS_MULTISIG:
          error = "is_multisig"
          break
      }
      ampli.testnetAccountImportFailed({
        "key import error": error,
        "imported account class hash": classHash,
      })
    }
  }

  async importAccount(account: ValidatedImport, password: string) {
    const { address, networkId, classHash, pk } = account
    const allImportedAccounts = await this.accountService.get(
      (acc) => acc.type === "imported",
    )

    const network = await this.networkService.getById(networkId)
    const derivationPath = getDerivationPathForIndex(
      allImportedAccounts.length,
      SignerType.PRIVATE_KEY,
      "imported",
    )
    const accountId = getAccountIdentifier(address, networkId, {
      type: SignerType.PRIVATE_KEY,
      derivationPath,
    })

    await this.pkManager.storeEncryptedKey(pk, password, accountId)

    const wa: WalletAccount = {
      id: accountId,
      address,
      networkId,
      signer: { type: SignerType.PRIVATE_KEY, derivationPath },
      name: `Imported Account ${allImportedAccounts.length + 1}`,
      type: "imported",
      network,
      needsDeploy: false,
      classHash,
      cairoVersion: "1", // We only support Cairo 1 accounts
    }

    await this.accountService.upsert(wa)

    return wa
  }

  private buildAccount(
    provider: ProviderInterface,
    address: Address,
    classHash: string,
    pk: Hex,
  ): ImportedAccount {
    const parsedPk = hexSchema.parse(pk)
    const pkSigner = new PrivateKeySigner(parsedPk)
    return new ImportedAccount(provider, address, pkSigner, "1", classHash)
  }

  private async validatePrivateKey(account: ImportedAccount) {
    try {
      const ethTransferCall = this.buildTransferCall(
        ETH_TOKEN_ADDRESS,
        BigInt(1),
      )
      await account.simulateTransaction([ethTransferCall], {
        // Using V1 instead of F1 because braavos skips the validation for F1 and F3
        // even if the skipValidate is false
        version: constants.TRANSACTION_VERSION.V1,
        skipValidate: false,
      })
    } catch {
      const strkTransferCall = this.buildTransferCall(
        STRK_TOKEN_ADDRESS,
        BigInt(1),
      )
      await account.simulateTransaction([strkTransferCall], {
        version: constants.TRANSACTION_VERSION.V3,
        skipValidate: false,
      })
    }
  }

  private buildTransferCall(tokenAddress: Address, amount: bigint) {
    return {
      type: TransactionType.INVOKE as const,
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata: CallData.compile(
        transferCalldataSchema.parse({
          recipient: tokenAddress,
          amount: uint256.bnToUint256(amount),
        }),
      ),
    }
  }

  private async hasGuardianSigner(account: ImportedAccount) {
    const entrypoints = ["get_guardian"] as const
    for (const entrypoint of entrypoints) {
      try {
        const [res] = await account.callContract({
          contractAddress: account.address,
          entrypoint,
        })

        if (num.toBigInt(res) !== 0n) {
          return true
        }
      } catch {
        // Ignore errors and try the next entrypoint
      }
    }

    return false
  }

  private async isMultisigAccount(account: ImportedAccount) {
    const entrypoints = [
      "get_threshold", // Argent Multisig
      "get_multisig_threshold", // Braavos MultiOwner (MOA)
    ] as const
    for (const entrypoint of entrypoints) {
      try {
        const [res] = await account.callContract({
          contractAddress: account.address,
          entrypoint,
        })
        if (num.toBigInt(res) > BigInt(1)) {
          return true
        }
      } catch {
        // Ignore errors and try the next entrypoint
      }
    }
    return false
  }
}
