import { isArray } from "lodash-es"
import { number } from "starknet"

import { IExplorerTransaction } from "../../../../shared/explorer/type"
import {
  getKnownDappForContractAddress,
  isKnownDappForContractAddress,
} from "../../../../shared/knownDapps"
import { Token } from "../../../../shared/token/type"
import { transactionNamesToTitle } from "../../../../shared/transactions"
import { isEqualAddress } from "../../../services/addresses"
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
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
}

export const transformExplorerTransaction = ({
  explorerTransaction,
  accountAddress,
  tokensByNetwork,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!explorerTransaction) {
    return
  }
  try {
    const fingerprint = fingerprintExplorerTransaction(explorerTransaction)
    const { calls, events, maxFee, actualFee, timestamp } = explorerTransaction
    let action: TransformedTransactionAction = "UNKNOWN"
    let entity: TransformedTransactionEntity = "UNKNOWN"
    let result: TransformedTransaction = {
      action,
      entity,
    }
    if (timestamp) {
      result.date = new Date(timestamp * 1000).toISOString()
    }
    const callNames = calls?.map(({ name }) => name)
    let displayName = callNames?.length
      ? transactionNamesToTitle(callNames)
      : "Unknown"
    if (maxFee && actualFee) {
      result = {
        ...result,
        maxFee: number.hexToDecimalString(maxFee),
        actualFee: number.hexToDecimalString(actualFee),
      }
    }
    switch (fingerprint) {
      case "events[Transfer] calls[transfer]": {
        action = "TRANSFER"
        entity = "TOKEN"
        displayName = "Transfer"
        const tokenAddress = events[0].address
        const parameters = events[0].parameters
        const fromAddress = getParameter(parameters, "from_")
        const toAddress = getParameter(parameters, "to")
        const amount = getParameter(parameters, "value")
        if (accountAddress && toAddress && fromAddress) {
          if (isEqualAddress(toAddress, accountAddress)) {
            action = "RECEIVE"
            displayName = "Receive"
          }
          if (isEqualAddress(fromAddress, accountAddress)) {
            action = "SEND"
            displayName = "Send"
          }
        }
        result = {
          ...result,
          fromAddress,
          toAddress,
          amount,
          tokenAddress,
        } as TokenTransferTransaction
        break
      }
      case "events[Approve,Transfer] calls[transferFrom]": {
        action = "TRANSFER"
        entity = "NFT"
        displayName = "Transfer NFT"
        const contractAddress = calls?.[0]?.address
        const parameters = calls?.[0]?.parameters
        const fromAddress = getParameter(parameters, "from_")
        const toAddress = getParameter(parameters, "to")
        const tokenId = getParameter(parameters, "tokenId")
        if (accountAddress && toAddress && fromAddress) {
          if (isEqualAddress(toAddress, accountAddress)) {
            action = "RECEIVE"
            displayName = "Receive NFT"
          }
          if (isEqualAddress(fromAddress, accountAddress)) {
            action = "SEND"
            displayName = "Send NFT"
          }
        }
        result = {
          ...result,
          fromAddress,
          toAddress,
          tokenId,
          contractAddress,
        } as NFTTransaction
        break
      }
      case "events[] calls[mint]": {
        action = "MINT"
        entity = "TOKEN"
        displayName = "Mint"
        const tokenAddress = calls?.[0]?.address
        const parameters = calls?.[0].parameters
        const amount = getParameter(parameters, "tokenId")
        result = {
          ...result,
          amount,
          tokenAddress,
        } as TokenMintTransaction
        break
      }
      case "events[Transfer] calls[mint]": {
        action = "MINT"
        entity = "NFT"
        displayName = "Mint NFT"
        const contractAddress = calls?.[0]?.address
        const parameters = events[0].parameters
        const tokenId =
          getParameter(parameters, "value") ||
          getParameter(parameters, "tokenId")
        result = {
          ...result,
          contractAddress,
          tokenId,
        } as NFTTransaction
        break
      }
      case "events[Upgraded] calls[upgrade]":
      case "events[account_upgraded] calls[upgrade]":
        action = "UPGRADE"
        entity = "ACCOUNT"
        displayName = "Upgrade account"
        break
      case "events[Upgraded]":
      case "events[]":
        if (!maxFee && actualFee === "0x0") {
          action = "CREATE"
          entity = "ACCOUNT"
          displayName = "Create acount"
          action = "CREATE"
          entity = "ACCOUNT"
          displayName = "Create acount"
        } else {
          console.warn("Expected fingerprint to be account create", fingerprint)
        }
        break
      case "events[Approval,Transfer,Transfer,Swap] calls[approve,swapExactTokensForTokens]": {
        /** Alpha Road swap */
        const event = getEntityWithName(events, "Swap")
        const call = getEntityWithName(calls, "swapExactTokensForTokens")
        if (event && call) {
          action = "SWAP"
          entity = "TOKEN"
          const parameters = event.parameters
          const dappContractAddress = call.address
          const fromTokenAddress = getParameter(
            parameters,
            "token_from_address",
          )
          const toTokenAddress = getParameter(parameters, "token_to_address")
          const fromAmount = getParameter(parameters, "amount_from")
          const toAmount = getParameter(parameters, "amount_to")
          result = {
            ...result,
            dappContractAddress,
            fromTokenAddress,
            toTokenAddress,
            fromAmount,
            toAmount,
          } as SwapTransaction
        }
        break
      }
      case "events[Approval,Transfer,Sync,Swap] calls[approve,swap_exact_tokens_for_tokens]": {
        /** Jediswap swap */
        const event = getEntityWithName(events, "Swap")
        const call = getEntityWithName(calls, "swap_exact_tokens_for_tokens")
        if (event && call) {
          const path = getParameter(call.parameters, "path")
          if (isArray(path)) {
            action = "SWAP"
            entity = "TOKEN"
            const dappContractAddress = call.address
            const fromTokenAddress = path[0]
            const toTokenAddress = path[path.length - 1]
            const fromAmount = getParameter(event.parameters, "amount1In")
            const toAmount = getParameter(event.parameters, "amount0Out")
            result = {
              ...result,
              dappContractAddress,
              fromTokenAddress,
              toTokenAddress,
              fromAmount,
              toAmount,
            } as SwapTransaction
          }
        }
        break
      }
      case "events[Approval,Transfer,Transfer] calls[approve]": {
        const call = getEntityWithName(calls, "approve")
        if (call) {
          const dappContractAddress = getParameter(call.parameters, "spender")
          const dapp = getKnownDappForContractAddress(dappContractAddress)
          /** TODO: implement an unchanging id instead of relying on host to be consistent */
          if (dapp?.host.endsWith("influenceth.io")) {
            /** influence nft purchase */
            action = "BUY"
            entity = "NFT"
            displayName = "Buy NFT"
            const dappContractAddress = getParameter(call.parameters, "spender")
            const contractAddress = events[2].address
            const tokenId = getParameter(events[2].parameters, "value")
            result = {
              ...result,
              dappContractAddress,
              contractAddress,
              tokenId,
            } as NFTTransaction
          } else {
            /** mySwap swap */
            action = "SWAP"
            entity = "TOKEN"
            const fromTokenAddress = events[1].address
            const toTokenAddress = events[2].address
            const fromAmount = getParameter(events[1].parameters, "value")
            const toAmount = getParameter(events[2].parameters, "value")
            result = {
              ...result,
              dappContractAddress,
              fromTokenAddress,
              toTokenAddress,
              fromAmount,
              toAmount,
            } as SwapTransaction
          }
        }
        break
      }
      case "events[Approval,Approval,Transfer,Transfer,Transfer] calls[approve]": {
        /** Aspect buy NFT */
        const call = getEntityWithName(calls, "approve")
        if (call) {
          action = "BUY"
          entity = "NFT"
          displayName = "Buy NFT"
          const dappContractAddress = getParameter(call.parameters, "spender")
          const contractAddress = events[2].address
          const tokenId = getParameter(events[2].parameters, "value")
          result = {
            ...result,
            dappContractAddress,
            contractAddress,
            tokenId,
          } as NFTTransaction
        }
        break
      }
      case "events[Transfer,Transfer,Approval,Transfer,TakerBid] calls[matchAskWithTakerBid]": {
        /** Mint Square buy NFT */
        const call = getEntityWithName(calls, "matchAskWithTakerBid")
        if (call) {
          action = "BUY"
          entity = "NFT"
          displayName = "Buy NFT"
          const dappContractAddress = call.address
          const contractAddress = events[2].address
          const tokenId = getParameter(events[2].parameters, "value")
          result = {
            ...result,
            dappContractAddress,
            contractAddress,
            tokenId,
          } as NFTTransaction
        }
        break
      }
      default: {
        /** still unknow - crude test if any event or call `address` is a known dapp */
        const eventsAndCalls = calls ? [...events, ...calls] : events
        for (const eventsOrCall of eventsAndCalls) {
          const dappContractAddress = eventsOrCall.address
          if (isKnownDappForContractAddress(dappContractAddress)) {
            entity = "DAPP"
            result = {
              ...result,
              dappContractAddress,
            }
            break
          }
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

    if (isSwapTransaction(result)) {
      const fromToken = getTokenForContractAddress(
        result.fromTokenAddress,
        tokensByNetwork,
      )
      const toToken = getTokenForContractAddress(
        result.toTokenAddress,
        tokensByNetwork,
      )
      displayName = `Sold ${fromToken?.symbol || "unknown"} for ${
        toToken?.symbol || "unknown"
      }`
      if (fromToken) {
        result.fromToken = fromToken
      }
      if (toToken) {
        result.toToken = toToken
      }
    }

    if (result.dappContractAddress) {
      const dapp = getKnownDappForContractAddress(result.dappContractAddress)
      if (dapp) {
        /** omit the contracts */
        const { contracts: _contracts, ...rest } = dapp
        result.dapp = rest
      }
    }

    result.displayName = displayName
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
    console.log(e)
  }
}
