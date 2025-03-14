import { getProvider } from "../../../shared/network"
import type { CairoVersion } from "starknet"
import { Account } from "starknet"

import { MultisigAccount } from "../../../shared/multisig/account"
import type { PendingMultisig } from "../../../shared/multisig/types"
import type { INetworkService } from "../../../shared/network/service/INetworkService"
import type { IRepository } from "../../../shared/storage/__new/interface"
import { getAccountCairoVersion } from "../../../shared/utils/argentAccountVersion"
import type {
  AccountId,
  ImportedLedgerAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { SignerType } from "../../../shared/wallet.model"
import type { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import type { WalletSessionService } from "../session/WalletSessionService"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { SessionError } from "../../../shared/errors/session"
import { AccountError } from "../../../shared/errors/account"
import type { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import { SmartAccount } from "../../../shared/smartAccount/account"
import type { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import { StarknetAccount } from "../../../shared/starknetAccount"
import { cosignerSign } from "../../../shared/smartAccount/backend/account"
import type { ILedgerSharedService } from "../../../shared/ledger/service/ILedgerSharedService"
import { union } from "lodash-es"
import { getCairo1AccountContractAddress } from "../../../shared/utils/getContractAddress"
import { getDerivationPathForIndex } from "../../../shared/signer/utils"
import {
  isContractDeployed,
  getLatestLedgerAccountClassHash,
  getLedgerAccountClassHashes,
} from "@argent/x-shared"
import type { BaseStarknetAccount } from "../../../shared/starknetAccount/base"
import { getAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import type { IAccountImportSharedService } from "../../../shared/accountImport/service/IAccountImportSharedService"
import type { ValidatedImport } from "../../../shared/accountImport/types"
import { ImportedAccount } from "../../../shared/accountImport/account"
import type { ISecretStorageService } from "../session/interface"

export class WalletAccountStarknetService {
  constructor(
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly sessionService: WalletSessionService,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly ledgerService: ILedgerSharedService,
    private readonly importedAccountService: IAccountImportSharedService,
    private readonly secretStorageService: ISecretStorageService,
  ) {}

  public async getStarknetAccount(
    accountId: AccountId,
    useLatest = false,
  ): Promise<BaseStarknetAccount> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const account = await this.accountSharedService.getAccount(accountId)
    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const provider = getProvider(
      account.network && account.network.rpcUrl
        ? account.network
        : await this.networkService.getById(account.networkId),
    )

    const signer = await this.cryptoStarknetService.getSignerForAccount(account)

    let cairoVersion: CairoVersion

    if (account.needsDeploy) {
      cairoVersion =
        await this.cryptoStarknetService.getUndeployedAccountCairoVersion(
          account,
        )
    } else if (useLatest) {
      cairoVersion = "1"
    } else {
      // Keep the fallback here as we don't want to block the users
      // if the worker has not updated the account yet
      cairoVersion =
        account.cairoVersion ??
        (await getAccountCairoVersion(
          account.address,
          account.network,
          account.type,
        ))

      if (!cairoVersion) {
        throw new AccountError({
          code: "DEPLOYED_ACCOUNT_CAIRO_VERSION_NOT_FOUND",
        })
      }
    }

    const starknetAccount = new Account(
      provider,
      account.address,
      signer,
      cairoVersion,
    )

    return this.getStarknetAccountOfType(starknetAccount, signer, account)
  }

  public async getSelectedStarknetAccount(): Promise<Account> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw Error("no open session")
    }

    const account = await this.accountSharedService.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    return this.getStarknetAccount(account.id)
  }

  public async newPendingMultisig(
    networkId: string,
    signerType: SignerType,
  ): Promise<PendingMultisig> {
    const { derivationPath, publicKey } =
      await this.cryptoStarknetService.getNextPublicKeyForMultisig(
        networkId,
        signerType,
      )

    const pendingMultisig: PendingMultisig = {
      name: "Multisig (Awaiting setup)",
      networkId,
      signer: {
        type: signerType,
        derivationPath,
      },
      publicKey,
      type: "multisig",
    }

    await this.pendingMultisigStore.upsert(pendingMultisig)

    return pendingMultisig
  }

  public getStarknetAccountOfType(
    account: Account,
    signer: BaseSignerInterface,
    walletAccount: Pick<WalletAccount, "type" | "guardian" | "classHash">,
  ) {
    switch (walletAccount.type) {
      case "multisig":
        return MultisigAccount.fromAccount(
          account,
          signer,
          walletAccount.classHash,
          this.multisigBackendService,
        )

      case "smart":
        return SmartAccount.fromAccount(
          account,
          signer,
          walletAccount.classHash,
          walletAccount.guardian,
          cosignerSign,
        )

      case "imported":
        return ImportedAccount.fromAccount(
          account,
          signer,
          walletAccount.classHash,
        )

      default:
        return StarknetAccount.fromAccount(
          account,
          signer,
          walletAccount.classHash,
        )
    }
  }

  public async getLedgerAccounts(
    networkId: string,
    start: number,
    total: number,
  ): Promise<ImportedLedgerAccount[]> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }

    const pubKeys = await this.ledgerService.generatePublicKeys(
      "standard",
      start,
      total,
    )
    const network = await this.networkService.getById(networkId)

    const defaultClassHash =
      await this.cryptoStarknetService.getAccountClassHashForNetwork(
        network,
        "standard",
      )

    const classHashes = union(getLedgerAccountClassHashes(), defaultClassHash)

    return pubKeys.flatMap(({ pubKey, index }) =>
      classHashes.map((classHash) => {
        const address = getCairo1AccountContractAddress(classHash, pubKey)
        const signer = {
          type: SignerType.LEDGER as const,
          derivationPath: getDerivationPathForIndex(
            index,
            SignerType.LEDGER,
            "standard",
          ),
        }

        return {
          id: getAccountIdentifier(address, networkId, signer),
          address,
          networkId,
          signer,
        }
      }),
    )
  }

  async addLedgerAccounts(
    importedAccounts: ImportedLedgerAccount[],
    networkId: string,
  ) {
    const accounts = await this.accountSharedService.walletStore.get(
      (acc) => acc.networkId === networkId,
    )

    const network = await this.networkService.getById(networkId)

    const ledgerAccountsToWalletAccounts = await Promise.all(
      importedAccounts.map(async ({ address, signer }, i) => {
        const needsDeploy = !(await isContractDeployed(
          getProvider(network),
          address,
        ))
        return this.accountSharedService.getDefaultStandardAccount({
          index: accounts.length + i,
          address,
          network,
          signerType: SignerType.LEDGER,
          classHash: getLatestLedgerAccountClassHash(), // make it more dynamic in future
          needsDeploy,
          signer,
        })
      }),
    )
    await this.accountSharedService.walletStore.upsert(
      ledgerAccountsToWalletAccounts,
    )

    return ledgerAccountsToWalletAccounts
  }

  async importAccount(account: ValidatedImport) {
    const decrypted = await this.secretStorageService.decrypt()
    if (!decrypted) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const { password } = decrypted

    return await this.importedAccountService.importAccount(account, password)
  }
}
