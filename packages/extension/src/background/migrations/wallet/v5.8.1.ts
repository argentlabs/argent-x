import { isEqualAddress } from "@argent/x-shared"
import { STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH } from "../../../shared/network/constants"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { WalletCryptoStarknetService } from "../../wallet/crypto/starknet.service"
import { WalletStorageProps } from "../../../shared/wallet/walletStore"
import { getAccountContractAddress } from "../../wallet/findImplementationForAddress"

export async function determineMigrationNeededV581(
  cryptoStarknetService: WalletCryptoStarknetService,
  walletStore: IRepository<WalletAccount>,
): Promise<WalletAccount[]> {
  const accounts = await walletStore.get()

  const accountNeedsToMigrate: [WalletAccount, boolean][] = await Promise.all(
    accounts.map(async (account) => {
      const { pubKey } = await cryptoStarknetService.getKeyPairByDerivationPath(
        account.signer.derivationPath,
      )
      const falseyAccountAddress = getAccountContractAddress(
        "1",
        STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
        pubKey,
      )

      return [account, isEqualAddress(falseyAccountAddress, account.address)]
    }),
  )

  const accountsToMigrate = accountNeedsToMigrate
    .filter(([, needsMigrate]) => needsMigrate)
    .map(([account]) => account)

  return accountsToMigrate
}

export async function migrateAccountsV581(
  falseyAccounts: WalletAccount[],
  walletStore: IRepository<WalletAccount>,
  store: IObjectStore<WalletStorageProps>,
) {
  const isFalseyAccount = (account?: BaseWalletAccount) =>
    falseyAccounts.some((f) => accountsEqual(f, account))

  // update accounts to hide the falsey ones
  await walletStore.upsert((account) =>
    account.map((x) =>
      isFalseyAccount(x)
        ? {
            ...x,
            hidden: true,
            showBlockingDeprecated: true,
          }
        : x,
    ),
  )

  // if selected account is in list of falsey accounts, select another one
  const { selected } = await store.get()
  if (isFalseyAccount(selected ?? undefined)) {
    const [firstValidAccount] = await walletStore.get(
      (account) => !account.hidden,
    )
    await store.set({
      selected: firstValidAccount
        ? {
            address: firstValidAccount.address,
            networkId: firstValidAccount.networkId,
          }
        : null,
    })
  }
}
