import {
  AddTransactionResponse,
  KeyPair,
  ProviderInterface,
  number,
} from "starknet"
import { Account as AccountV390, stark as starkV390 } from "starknet-390"

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
        {
          maxFee: "0",
        },
      )
    }
  }

  throw new Error(`Unsupported implementation: ${oldImplementation}`)
}
