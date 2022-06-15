import {
  Account,
  AddTransactionResponse,
  KeyPair,
  ProviderInterface,
  number,
  stark,
} from "starknet"

import { getNetwork } from "./customNetworks"
import { TransactionTracker } from "./transactions/transactions"
import { Wallet } from "./wallet"

export const getImplementationUpgradePath = (
  _oldImplementation: number.BigNumberish,
): ((
  newImplementation: number.BigNumberish,
  accountAddress: string,
  provider: ProviderInterface,
  keyPair: KeyPair,
) => Promise<AddTransactionResponse>) => {
  // default to newest starknet.js implementation to allow custom networks to upgrade wallets aswell
  return (newImplementation, accountAddress, provider, keyPair) => {
    const account = new Account(
      provider as any, // this is a bug in old starknet versions where Provider was used instead of ProviderInterface
      accountAddress,
      keyPair,
    )

    return account.execute(
      {
        contractAddress: accountAddress,
        entrypoint: "upgrade",
        calldata: stark.compileCalldata({
          implementation: newImplementation,
        }),
      },
      undefined,
    )
  }
}

export const upgradeAccount = async (
  accountAddress: string,
  wallet: Wallet,
  transactionTracker: TransactionTracker,
) => {
  const starknetAccount = await wallet.getStarknetAccountByAddress(
    accountAddress,
  )

  const account = await wallet.getAccountByAddress(accountAddress)
  const { accountClassHash: newImplementation } = await getNetwork(
    account.network.id,
  )

  const { result } = await starknetAccount.callContract({
    contractAddress: account.address,
    entrypoint: "get_implementation",
  })
  const currentImplementation = stark.makeAddress(number.toHex(result[0]))

  const updateAccount = getImplementationUpgradePath(currentImplementation)

  const updateTransaction = await updateAccount(
    newImplementation,
    account.address,
    // Account extends Provider
    starknetAccount,
    // signer is a private property of the account, this will be public in the future
    wallet.getKeyPairByDerivationPath(account.signer.derivationPath),
  )

  transactionTracker.add({
    hash: updateTransaction.transaction_hash,
    account,
    meta: { title: "Upgrading account" },
  })
}
