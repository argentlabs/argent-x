import {
  Account,
  AddTransactionResponse,
  KeyPair,
  ProviderInterface,
  constants,
  number,
  stark,
} from "starknet"
import { Account as AccountV390, stark as starkV390 } from "starknet-390"

import { BaseWalletAccount } from "../shared/wallet.model"
import { hasNewDerivationPath } from "../shared/wallet.service"
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

// FIXME: remove when we dont want to support old accounts anymore
const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_MAINNET =
  "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac"
const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_GOERLI =
  "0x070a61892f03b34f88894f0fb9bb4ae0c63a53f5042f79997862d1dffb8d6a30"

export const getImplementationUpgradePath = (
  oldImplementation: number.BigNumberish,
  derivationPath: string,
): ((
  _newImplementation: number.BigNumberish,
  accountAddress: string,
  provider: ProviderInterface,
  keyPair: KeyPair,
) => Promise<AddTransactionResponse>) => {
  if (
    !hasNewDerivationPath(derivationPath) &&
    (equalBigNumberish(
      oldImplementation,
      "0x0090aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
    ) ||
      equalBigNumberish(
        oldImplementation,
        "0x05f28c66afd8a6799ddbe1933bce2c144625031aafa881fa38fa830790eff204",
      ))
  ) {
    return (newImplementation, accountAddress, provider, keyPair) => {
      const oldAccount = new AccountV390(
        provider as any, // this is a bug in old starknet versions where Provider was used instead of ProviderInterface
        accountAddress,
        keyPair,
      )

      return oldAccount.execute({
        contractAddress: accountAddress,
        entrypoint: "upgrade",
        calldata: starkV390.compileCalldata({
          implementation:
            provider.chainId === constants.StarknetChainId.TESTNET
              ? LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_GOERLI
              : LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS_MAINNET,
        }),
      })
    }
  }

  // default to newest starknet.js implementation to allow custom networks to upgrade wallets aswell
  return (newImplementation, accountAddress, provider, keyPair) => {
    const account = new Account(provider, accountAddress, keyPair)

    return account.execute({
      contractAddress: accountAddress,
      entrypoint: "upgrade",
      calldata: stark.compileCalldata({
        implementation: newImplementation,
      }),
    })
  }
}

export const upgradeAccount = async (
  account: BaseWalletAccount,
  wallet: Wallet,
  transactionTracker: TransactionTracker,
) => {
  const starknetAccount = await wallet.getStarknetAccount(account)
  const fullAccount = await wallet.getAccount(account)

  const { accountClassHash: newImplementation } = await getNetwork(
    fullAccount.network.id,
  )

  const { result } = await starknetAccount.callContract({
    contractAddress: fullAccount.address,
    entrypoint: "get_implementation",
  })
  const currentImplementation = stark.makeAddress(number.toHex(result[0]))

  const updateAccount = getImplementationUpgradePath(
    currentImplementation,
    fullAccount.signer.derivationPath,
  )

  const updateTransaction = await updateAccount(
    newImplementation,
    fullAccount.address,
    // Account extends Provider
    starknetAccount,
    // signer is a private property of the account, this will be public in the future
    wallet.getKeyPairByDerivationPath(fullAccount.signer.derivationPath),
  )

  transactionTracker.add({
    hash: updateTransaction.transaction_hash,
    account: fullAccount,
    meta: { title: "Upgrading account" },
  })
}
