import { memoize } from "lodash-es"
import { Account } from "starknet"
import {
  Account as AccountV4__deprecated,
  ec as ec__deprecated,
} from "starknet4-deprecated"

import { MultisigAccount } from "../../../shared/multisig/account"
import { PendingMultisig } from "../../../shared/multisig/types"
import { getProvider } from "../../../shared/network"
import { getProviderv4__deprecated } from "../../../shared/network/provider"
import { INetworkService } from "../../../shared/network/service/interface"
import { IRepository } from "../../../shared/storage/__new/interface"
import { getAccountCairoVersion } from "../../../shared/utils/argentAccountVersion"
import {
  ArgentAccountType,
  BaseWalletAccount,
} from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isKeyPair } from "../../keys/keyDerivation"
import { WalletCryptoStarknetService } from "../crypto/starknet.service"
import { WalletSessionService } from "../session/session.service"
import { WalletAccountSharedService } from "./shared.service"
import { SessionError } from "../../../shared/errors/session"
import { AccountError } from "../../../shared/errors/account"
import { IMultisigBackendService } from "../../../shared/multisig/service/backend/interface"

const isNonceManagedOnAccountContract = memoize(
  async (account: AccountV4__deprecated, _: BaseWalletAccount) => {
    try {
      // This will fetch nonce from account contract instead of Starknet OS
      await account.getNonce()
      return true
    } catch {
      return false
    }
  },
  (_, account) => {
    const id = getAccountIdentifier(account)
    // memoize for max 5 minutes
    const timestamp = Math.floor(Date.now() / 1000 / 60 / 5)
    return `${id}-${timestamp}`
  },
)

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
  ): Promise<Account | AccountV4__deprecated> {
    if (!(await this.sessionService.isSessionOpen())) {
      throw new SessionError({ code: "NO_OPEN_SESSION" })
    }
    const account = await this.accountSharedService.getAccount(selector)
    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const provider = getProvider(
      account.network && account.network.sequencerUrl
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
        pkOrSigner,
        cairoVersion,
      )

      return this.getStarknetAccountOfType(starknetAccount, account.type)
    }

    if (useLatest) {
      const starknetAccount = new Account(
        provider,
        account.address,
        pkOrSigner,
        "1",
      )

      return this.getStarknetAccountOfType(starknetAccount, account.type)
    }

    const providerV4 = getProviderv4__deprecated(account.network)

    const oldAccount = new AccountV4__deprecated(
      providerV4,
      account.address,
      isKeyPair(signer)
        ? ec__deprecated.getKeyPair(signer.getPrivate())
        : signer,
    )

    const isOldAccount = await isNonceManagedOnAccountContract(
      oldAccount,
      account,
    )

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
      pkOrSigner,
      accountCairoVersion,
    )

    return isOldAccount
      ? oldAccount
      : this.getStarknetAccountOfType(starknetAccount, account.type)
  }

  public async getSelectedStarknetAccount(): Promise<
    Account | AccountV4__deprecated
  > {
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

  public getStarknetAccountOfType(
    account: Account | AccountV4__deprecated,
    type: ArgentAccountType,
  ) {
    if (type === "multisig") {
      return MultisigAccount.fromAccount(account, this.multisigBackendService)
    }
    return account
  }
}
