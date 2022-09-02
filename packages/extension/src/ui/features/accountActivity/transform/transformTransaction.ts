import { isArray } from "lodash-es"
import { number } from "starknet"

import { isErc20MintCall } from "../../../../shared/call"
import { parseErc20Call } from "../../../../shared/call/erc20Call"
import {
  isErc20TransferCall,
  parseErc20TransferCall,
} from "../../../../shared/call/erc20TransferCall"
import {
  isErc721TransferCall,
  parseErc721TransferCall,
} from "../../../../shared/call/erc721TransferCall"
import { IExplorerTransaction } from "../../../../shared/explorer/type"
import {
  getKnownDappForContractAddress,
  isKnownDappForContractAddress,
} from "../../../../shared/knownDapps"
import { Token } from "../../../../shared/token/type"
import {
  Transaction,
  transactionNamesToTitle,
} from "../../../../shared/transactions"
import {
  formatTruncatedAddress,
  isEqualAddress,
} from "../../../services/addresses"
import { ActivityTransaction } from "../useActivity"
import { fingerprintExplorerTransaction } from "./fingerprintExplorerTransaction"
import { getEntityWithName } from "./getEntityWithName"
import { getParameter } from "./getParameter"
import { getTokenForContractAddress } from "./getTokenForContractAddress"
import {
  isSwapTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "./is"
import {
  NFTTransaction,
  SwapTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
  TransformedTransaction,
  TransformedTransactionAction,
  TransformedTransactionEntity,
} from "./type"

export interface ITransformExplorerTransaction {
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
}

export const transformTransaction = ({
  transaction,
  accountAddress,
  tokensByNetwork,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!transaction) {
    return
  }
  try {
    const { meta, timestamp, hash } = transaction
    let action: TransformedTransactionAction = "UNKNOWN"
    let entity: TransformedTransactionEntity = "UNKNOWN"
    let result: TransformedTransaction = {
      action,
      entity,
    }
    if (timestamp) {
      result.date = new Date(timestamp * 1000).toISOString()
    }
    let displayName = meta?.title || formatTruncatedAddress(hash)
    if (meta?.transactions) {
      const { transactions } = meta
      const calls = Array.isArray(transactions) ? transactions : [transactions]
      const entrypointNames = calls.map(({ entrypoint }) => entrypoint)
      if (entrypointNames.length) {
        const entrypointDisplayName = transactionNamesToTitle(entrypointNames)
        if (entrypointDisplayName) {
          displayName = entrypointDisplayName
        }
      }
      for (const call of calls) {
        const dapp = getKnownDappForContractAddress(call.contractAddress)
        if (dapp && !result.dapp) {
          /** omit the contracts */
          entity = "DAPP"
          const { contracts: _contracts, ...rest } = dapp
          result = {
            ...result,
            dappContractAddress: call.contractAddress,
            dapp: rest,
          }
        }
        const isErc20Transfer = isErc20TransferCall(call)
        const isErc20Mint = isErc20MintCall(call)
        if (isErc20Transfer || isErc20Mint) {
          action = isErc20Transfer ? "TRANSFER" : "MINT"
          entity = "TOKEN"
          const { contractAddress, recipientAddress, amount } =
            parseErc20Call(call)
          result = {
            ...result,
            fromAddress: accountAddress,
            toAddress: recipientAddress,
            amount,
            tokenAddress: contractAddress,
          } as TokenTransferTransaction
          break
        } else if (isErc721TransferCall(call)) {
          action = "TRANSFER"
          entity = "NFT"
          displayName = "Transfer NFT"
          const { contractAddress, fromAddress, toAddress, tokenId } =
            parseErc721TransferCall(call)
          result = {
            ...result,
            fromAddress,
            toAddress,
            tokenId,
            contractAddress,
          } as NFTTransaction
        }
      }
    }

    result = {
      ...result,
      action,
      entity,
    }

    if (isTokenTransferTransaction(result) || isTokenMintTransaction(result)) {
      const token = getTokenForContractAddress(
        result.tokenAddress,
        tokensByNetwork,
      )
      if (token) {
        result.token = token
      }
    }

    result.displayName = displayName
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
    console.log(e)
  }
}
