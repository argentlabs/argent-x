import {
  Account,
  AddTransactionResponse,
  KeyPair,
  ProviderInterface,
  number,
  stark,
} from "starknet"
import { Account as AccountV390, stark as starkV390 } from "starknet-390"

import { getNetwork } from "./customNetworks"
import { TransactionTracker } from "./transactions/transactions"
import { Wallet } from "./wallet"

function equalBigNumberish(
  a: number.BigNumberish,
  b: number.BigNumberish,
): boolean {
  const aBN = number.toBN(a)
  const bBN = number.toBN(b)
  return aBN.eq(bBN)
}

export const getImplementationUpgradePath = (
  oldImplementation: number.BigNumberish,
): ((
  newImplementation: number.BigNumberish,
  accountAddress: string,
  provider: ProviderInterface,
  keyPair: KeyPair,
) => Promise<AddTransactionResponse>) => {
  if (
    equalBigNumberish(
      oldImplementation,
      "0x0090aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
    ) ||
    equalBigNumberish(
      oldImplementation,
      "0x05f28c66afd8a6799ddbe1933bce2c144625031aafa881fa38fa830790eff204",
    )
  ) {
    return (newImplementation, accountAddress, provider, keyPair) => {
      const oldAccount = new AccountV390(
        provider as any, // this is a bug in old starknet versions where Provider was used instead of ProviderInterface
        accountAddress,
        keyPair,
      )

      return oldAccount.execute(
        {
          contractAddress: accountAddress,
          entrypoint: "upgrade",
          calldata: starkV390.compileCalldata({
            implementation: newImplementation,
          }),
        },
        undefined,
      )
    }
  }

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
  walletAddress: string,
  wallet: Wallet,
  transactionTracker: TransactionTracker,
) => {
  const starknetAccount = await wallet.getStarknetAccountByAddress(
    walletAddress,
  )

  const account = await wallet.getAccountByAddress(walletAddress)
  const { accountImplementation: newImplementation } = await getNetwork(
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
