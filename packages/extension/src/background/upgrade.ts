import {
  AddTransactionResponse,
  KeyPair,
  ProviderInterface,
  number,
} from "starknet"
import { Account as OldAccountV390, stark as starkV390 } from "starknet-390"

export const getImplementationUpgradePath = (
  oldImplementation: number.BigNumberish,
): ((
  newImplementation: number.BigNumberish,
  accountAddress: string,
  provider: ProviderInterface,
  keyPair: KeyPair,
) => Promise<AddTransactionResponse>) => {
  switch (true) {
    case number
      .toBN(oldImplementation)
      .eq(
        number.toBN(
          "0x0090aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
        ),
      ):
      return (newImplementation, accountAddress, provider, keyPair) => {
        const oldAccount = new OldAccountV390(
          provider as any, // this is a bug in old starknet versions where Provider was used instead of ProviderInterface
          accountAddress,
          keyPair,
        )

        console.log({
          contractAddress: accountAddress,
          entrypoint: "upgrade",
          calldata: starkV390.compileCalldata({
            implementation: newImplementation,
          }),
        })

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
    default:
      throw new Error(`Unsupported implementation: ${oldImplementation}`)
  }
}
