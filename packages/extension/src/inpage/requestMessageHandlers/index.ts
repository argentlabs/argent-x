import {
  type RpcMessage,
  type RequestFnCall,
  type RpcTypeToMessageMap,
} from "@starknet-io/types-js"

import { watchAssetHandler } from "./watchAsset"
import { requestAccountsHandler } from "./requestAccounts"
import { addInvokeTransactionHandler } from "./invokeTransaction"
import { switchStarknetChainHandler } from "./switchStarknetChain"
import { addStarknetChainHandler } from "./addStarknetChain"
import { addDeclareTransactionHandler } from "./addDeclareTransaction"
import { signTypedDataHandler } from "./signTypedData"
import { requestChainIdHandler } from "./requestChainIdHandler"
import { getPermissionsHandler } from "./getPermissionsHandler"
import { deploymentDataHandler } from "./deploymentData"
import { supportedSpecsHandler } from "./supportedSpecs"

export async function requestMessageHandler<T extends RpcMessage["type"]>(
  call: RequestFnCall<T>,
): Promise<RpcTypeToMessageMap[T]["result"]> {
  const handlerMap: Record<RpcMessage["type"], (params?: any) => Promise<any>> =
    {
      wallet_addStarknetChain: addStarknetChainHandler,
      wallet_switchStarknetChain: switchStarknetChainHandler,
      wallet_watchAsset: watchAssetHandler,
      wallet_requestAccounts: requestAccountsHandler,
      wallet_getPermissions: getPermissionsHandler,
      wallet_requestChainId: requestChainIdHandler,
      wallet_deploymentData: deploymentDataHandler,
      wallet_addDeclareTransaction: addDeclareTransactionHandler,
      wallet_addInvokeTransaction: addInvokeTransactionHandler,
      wallet_signTypedData: signTypedDataHandler,
      wallet_supportedSpecs: supportedSpecsHandler,
      wallet_supportedWalletApi: async () => {
        // not implemented
        throw new Error("Not implemented")
      },
    }

  const handler = handlerMap[call.type]
  if (handler) {
    return "params" in call ? handler(call.params) : handler()
  }

  throw new Error(`Unknown request type: ${call.type}`)
}
