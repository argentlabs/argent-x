import { getProvider6 } from "../../../shared/network"
import { Account } from "starknet6"

import { MultisigAccount } from "../../../shared/multisig/account"
import { PendingMultisig } from "../../../shared/multisig/types"
import { INetworkService } from "../../../shared/network/service/interface"
import { IRepository } from "../../../shared/storage/__new/interface"
import { getAccountCairoVersion } from "../../../shared/utils/argentAccountVersion"
import {
  ArgentAccountType,
  BaseWalletAccount,
} from "../../../shared/wallet.model"
import { isKeyPair } from "../../keys/keyDerivation"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { WalletSessionService } from "../session/session.service"
import { WalletAccountSharedService } from "../../../shared/account/service/shared.service"
import { SessionError } from "../../../shared/errors/session"
import { AccountError } from "../../../shared/errors/account"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/interface"

export class WalletAccountStarknetService {
  constructor(
    private readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly networkService: Pick<INetworkService, "getById">,
    private readonly sessionService: WalletSessionService,
    private readonly accountSharedService: WalletAccountSharedService,
    private readonly cryptoStarknetService: WalletCryptoStarknetService,
    private readonly multisigBackendService: IMultisigBackendService,
  ) {}

  public async getStarknetAccount(
    selector: BaseWalletAccount,
    useLatest = false,
  ): Promise<Account> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const account = await this.accountSharedService.getAccount(selector)
    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const provider = getProvider6(
      account.network && account.network.rpcUrl
        ? account.network
        : await this.networkService.getById(selector.networkId),
    )

    const signer = await this.cryptoStarknetService.getSignerForAccount(account)

    const pkOrSigner = isKeyPair(signer) ? signer.getPrivate() : signer

    if (account.needsDeploy) {
      const cairoVersion =
        await this.cryptoStarknetService.getUndeployedAccountCairoVersion(
          selector,
        )

      const starknetAccount = new Account(
        provider,
        account.address,
        pkOrSigner as any, // TODO: migrate to snjsv6 completely
        cairoVersion,
      )

      return this.getStarknetAccountOfType(starknetAccount, account.type)
    }

    if (useLatest) {
      const starknetAccount = new Account(
        provider,
        account.address,
        pkOrSigner as any, // TODO: migrate to snjsv6 completely
        "1",
      )

      return this.getStarknetAccountOfType(starknetAccount, account.type)
    }

    // Keep the fallback here as we don't want to block the users
    // if the worker has not updated the account yet
    const accountCairoVersion =
      account.cairoVersion ??
      (await getAccountCairoVersion(
        account.address,
        account.network,
        account.type,
      ))

    if (!accountCairoVersion) {
      throw new AccountError({
        code: "DEPLOYED_ACCOUNT_CAIRO_VERSION_NOT_FOUND",
      })
    }

    const starknetAccount = new Account(
      provider,
      account.address,
      pkOrSigner as any, // TODO: migrate to snjsv6 completely
      accountCairoVersion,
    )

    return this.getStarknetAccountOfType(starknetAccount, account.type)
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

  public async newPendingMultisig(networkId: string): Promise<PendingMultisig> {
    const { index, derivationPath, publicKey } =
      await this.cryptoStarknetService.getNextPublicKeyForMultisig(networkId)

    const pendingMultisig: PendingMultisig = {
      name: `Multisig ${index + 1}`,
      networkId,
      signer: {
        type: "local_secret",
        derivationPath,
      },
      publicKey,
      type: "multisig",
    }

    await this.pendingMultisigStore.upsert(pendingMultisig)

    return pendingMultisig
  }

  public getStarknetAccountOfType(account: Account, type: ArgentAccountType) {
    if (type === "multisig") {
      return MultisigAccount.fromAccount(account, this.multisigBackendService)
    }
    return account
  }
}
