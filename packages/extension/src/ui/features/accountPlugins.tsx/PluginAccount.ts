import { Abi, Call, CallData, Contract, hash, num } from "starknet"

import ArgentPluginCompiledContractAbi from "../../../abis/ArgentPluginAccount.json"
import { executeTransaction } from "../../services/backgroundTransactions"
import { Account as ArgentXAccount } from "../accounts/Account"
import {
  addPluginCalldataSchema,
  executeOnPluginCalldataSchema,
  removePluginCalldataSchema,
} from "@argent/shared"

export class PluginAccount extends ArgentXAccount {
  constructor(account: ArgentXAccount) {
    super({
      ...account,
      type: "plugin",
      contract: new Contract(
        ArgentPluginCompiledContractAbi as Abi,
        account.address,
        account.provider,
      ),
    })
  }

  public static accountToPluginAccount(account?: ArgentXAccount) {
    if (!account) {
      throw new Error("Cannot convert to Plugin Account")
    }

    return new PluginAccount(account)
  }

  public async isPlugin(pluginClassHash: string): Promise<boolean> {
    const classHash = num.hexToDecimalString(pluginClassHash)

    const result = await this.contract.isPlugin(classHash)

    return result.success !== 0n
  }

  public addPlugin(pluginClassHash: string) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "addPlugin",
        calldata: addPluginCalldataSchema.parse([
          num.hexToDecimalString(pluginClassHash),
        ]),
      },
    })
  }

  public removePlugin(pluginClassHash: string) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "removePlugin",
        calldata: removePluginCalldataSchema.parse([
          num.hexToDecimalString(pluginClassHash),
        ]),
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
        entrypoint: "executeOnPlugin",
        calldata: executeOnPluginCalldataSchema.parse([
          pluginClassHash,
          hash.getSelectorFromName(call.entrypoint),
          call.calldata?.length ?? 0,
          ...num.bigNumberishArrayToDecimalStringArray(
            CallData.toCalldata(call.calldata),
          ),
        ]),
      },
    })
  }
}
