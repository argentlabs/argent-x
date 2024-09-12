import { getProvider } from "../../../shared/network"
import { Account, CairoVersion } from "starknet"

import { MultisigAccount } from "../../../shared/multisig/account"
import { PendingMultisig } from "../../../shared/multisig/types"
import { INetworkService } from "../../../shared/network/service/INetworkService"
import { IRepository } from "../../../shared/storage/__new/interface"
import { getAccountCairoVersion } from "../../../shared/utils/argentAccountVersion"
import {
  BaseWalletAccount,
  ImportedLedgerAccount,
  SignerType,
  WalletAccount,
} from "../../../shared/wallet.model"
import { WalletCryptoStarknetService } from "../crypto/WalletCryptoStarknetService"
import { WalletSessionService } from "../session/WalletSessionService"
import { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { SessionError } from "../../../shared/errors/session"
import { AccountError } from "../../../shared/errors/account"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/IMultisigBackendService"
import { SmartAccount } from "../../../shared/smartAccount/account"
import { BaseSignerInterface } from "../../../shared/signer/BaseSignerInterface"
import { StarknetAccount } from "../../../shared/starknetAccount"
import { cosignerSign } from "../../../shared/smartAccount/backend/account"
import { ILedgerSharedService } from "../../../shared/ledger/service/ILedgerSharedService"
import { union } from "lodash-es"
import { getCairo1AccountContractAddress } from "../../../shared/utils/getContractAddress"
import { getBaseDerivationPath } from "../../../shared/signer/utils"
import {
  isContractDeployed,
  getLatestLedgerAccountClassHash,
  getLedgerAccountClassHashes,
} from "@argent/x-shared"
import { BaseStarknetAccount } from "../../../shared/starknetAccount/base"

export class WalletAccountStarknetService {
  constructor(
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly sessionService: WalletSessionService,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly multisigBackendService: IMultisigBackendService,
    private readonly ledgerService: ILedgerSharedService,
  ) {}

  public async getStarknetAccount(
    selector: BaseWalletAccount,
    useLatest = false,
  ): Promise<BaseStarknetAccount> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const account = await this.accountSharedService.getAccount(selector)
    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const provider = getProvider(
      account.network && account.network.rpcUrl
        ? account.network
        : await this.networkService.getById(selector.networkId),
    )

    const signer = await this.cryptoStarknetService.getSignerForAccount(account)

    let cairoVersion: CairoVersion

    if (account.needsDeploy) {
      cairoVersion =
        await this.cryptoStarknetService.getUndeployedAccountCairoVersion(
          selector,
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

    return this.getStarknetAccount(account)
  }

  public async newPendingMultisig(
    networkId: string,
    signerType: SignerType,
  ): Promise<PendingMultisig> {
    const { index, derivationPath, publicKey } =
      await this.cryptoStarknetService.getNextPublicKeyForMultisig(
        networkId,
        signerType,
      )

    const pendingMultisig: PendingMultisig = {
      name: `Multisig ${index + 1}`,
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
        return {
          address: getCairo1AccountContractAddress(classHash, pubKey),
          networkId,
          signer: {
            type: SignerType.LEDGER as const,
            derivationPath: `${getBaseDerivationPath("standard", SignerType.LEDGER)}/${index}`,
          },
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
}
