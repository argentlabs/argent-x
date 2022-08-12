import {
  Account,
  Call,
  KeyPair,
  ProviderInterface,
  ProviderOptions,
  SignerInterface,
  hash,
  number,
} from "starknet"

import { executeTransaction } from "../../services/backgroundTransactions"
import { Account as ArgentXAccount } from "../accounts/Account"

export class PluginAccount extends Account {
  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    public address: string,
    keyPairOrSigner: KeyPair | SignerInterface,
  ) {
    super(providerOrOptions, address, keyPairOrSigner)
  }

  public static accountToPluginAccount(account?: ArgentXAccount) {
    if (!account) {
      throw new Error("Cannot convert to Plugin Account")
    }

    return new PluginAccount(account.provider, account.address, account.signer)
  }

  public async isPlugin(pluginClassHash: string): Promise<boolean> {
    const res = await this.callContract({
      contractAddress: this.address,
      entrypoint: "is_plugin",
      calldata: [number.hexToDecimalString(pluginClassHash)],
    })

    return Boolean(parseInt(res.result[0], 16))
  }

  public addPlugin(pluginClassHash: string) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "add_plugin",
        calldata: [number.hexToDecimalString(pluginClassHash)],
      },
    })
  }

  public removePlugin(pluginClassHash: string) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "remove_plugin",
        calldata: [number.hexToDecimalString(pluginClassHash)],
      },
    })
  }

  public async executeOnPlugin(
    pluginClassHash: string,
    call: Omit<Call, "contractAddress">,
  ) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "execute_on_plugin",
        calldata: [
          pluginClassHash,
          hash.getSelectorFromName(call.entrypoint),
          call.calldata?.length ?? 0,
          call.calldata,
        ],
      },
    })
  }
}
