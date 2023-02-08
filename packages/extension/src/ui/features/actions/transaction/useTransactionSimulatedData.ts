import BigNumber from "bignumber.js"
import { Dictionary } from "lodash"
import { groupBy, reduce } from "lodash-es"
import { useMemo } from "react"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionSimulationResponse,
  TokenDetails,
  TransactionSimulationTransfer,
} from "../../../../shared/transactionSimulation/types"
import { parseIPFSUri } from "../../../services/ipfs"
import { useAspectContractAddresses } from "./../../accountNfts/aspect.service"
import { Account } from "../../accounts/Account"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useTokensRecord } from "../../accountTokens/tokens.state"
import { useCurrentNetwork } from "../../networks/useNetworks"

interface CommonSimulationData {
  token: Token
  amount: BigNumber
  usdValue?: number
}

interface ApprovalSimulationData extends CommonSimulationData {
  owner: string
  spender: string
}

interface Recipient {
  address: string
  amount: BigNumber
  usdValue?: number
}

export interface TokenWithType extends Token {
  type: "erc20" | "erc721" | "erc1155"
  tokenId?: string
}

export interface AggregatedSimData extends CommonSimulationData {
  token: TokenWithType
  recipients: Recipient[]
  approvals: ApprovalSimulationData[]
  safe?: boolean
}

export interface IUseTransactionSimulatedData {
  transactionSimulation: ApiTransactionSimulationResponse
}

export const useAggregatedSimData = (
  transactionSimulation: ApiTransactionSimulationResponse = {
    transfers: [],
    approvals: [],
  },
) => {
  const network = useCurrentNetwork()
  const account = useSelectedAccount()

  // Need to clean hex because the API returns addresses with unpadded 0s
  const erc20TokensRecord = useTokensRecord({ cleanHex: true })
  const { data: nftContracts } = useAspectContractAddresses()

  const { transfers, approvals } = transactionSimulation

  const aggregatedData = useMemo(() => {
    const filteredTransfers = transfers.filter(
      (t) => account && transferAffectsBalance(t, account),
    )

    const transfersByTokenAddress = groupBy(filteredTransfers, "tokenAddress")
    const approvalsByTokenAddress = groupBy(approvals, "tokenAddress")

    const ZERO = new BigNumber(0)

    return reduce<
      Dictionary<TransactionSimulationTransfer[]>,
      Record<string, AggregatedSimData>
    >(
      transfersByTokenAddress,
      (acc, transfers, tokenAddress) => {
        const validatedToken = apiTokenDetailsToToken({
          tokenAddress,
          details: transfers[0].details,
          networkId: network.id,
          erc20TokensRecord,
          nftContracts,
          tokenId: transfers[0].value, // Works for ERC721 and ERC1155
        })

        // Ignore tokens that we don't have a record of
        if (!validatedToken) {
          return acc
        }

        const approvalsForTokens = approvalsByTokenAddress[tokenAddress]

        const approvals: ApprovalSimulationData[] =
          approvalsForTokens?.map((a) => ({
            token: validatedToken,
            owner: a.owner,
            spender: a.spender,
            amount: new BigNumber(
              a.details?.tokenType === "erc20" ? a.value : 1,
            ),

            usdValue: a.details?.usdValue
              ? parseFloat(a.details.usdValue)
              : undefined,
          })) ?? []

        const amount = transfers.reduce<BigNumber>((acc, t) => {
          if (t.from === account?.address) {
            return t.details?.tokenType === "erc20"
              ? acc.minus(t.value)
              : acc.minus(1)
          }

          return t.details?.tokenType === "erc20"
            ? acc.plus(t.value)
            : acc.plus(1)
        }, ZERO)

        const usdValue = transfers.reduce<number>((acc, t) => {
          if (!t.details?.usdValue) {
            return acc
          }

          if (t.from === account?.address) {
            return acc - parseFloat(t.details.usdValue)
          }

          return acc + parseFloat(t.details.usdValue)
        }, 0)

        const recipients = transfers.reduce<Recipient[]>((acc, t) => {
          return [
            ...acc,
            {
              address: t.to,
              amount: new BigNumber(t.value),
              usdValue: t.details?.usdValue
                ? parseFloat(t.details.usdValue)
                : undefined,
            },
          ]
        }, [])

        const totalApprovalAmount = approvals.reduce<BigNumber>(
          (acc, a) => acc.plus(a.amount),
          ZERO,
        )

        const safe = totalApprovalAmount.lte(amount.abs())

        return {
          ...acc,
          [tokenAddress]: {
            token: validatedToken,
            amount,
            usdValue,
            recipients,
            approvals,
            safe,
          },
        }
      },
      {},
    )
  }, [
    transfers,
    approvals,
    account,
    network.id,
    erc20TokensRecord,
    nftContracts,
  ])

  return Object.values(aggregatedData)
}

export function apiTokenDetailsToToken({
  tokenAddress,
  networkId,
  details,
  erc20TokensRecord,
  tokenId,
  nftContracts = [],
}: {
  tokenAddress: string
  details?: TokenDetails
  networkId: string
  tokenId: string
  erc20TokensRecord: Record<string, Token>
  nftContracts?: string[]
}): TokenWithType | undefined {
  // Try to get the token from the tokensRecord
  const token = erc20TokensRecord[tokenAddress]
  if (token) {
    return {
      ...token,
      type: "erc20",
    }
  }

  // If the token is not in the tokensRecord, try to get it from the details
  if (details) {
    const token = {
      address: tokenAddress,
      name: details.name,
      symbol: details.symbol,
      decimals: parseInt(details.decimals ?? "0"),
      networkId: networkId,
      image: undefined,
    }

    if (details.tokenType === "erc20") {
      return {
        ...token,
        type: "erc20",
      }
    } else if (details.tokenType === "erc721") {
      return {
        ...token,
        tokenId,
        type: "erc721",
      }
    } else {
      return {
        ...token,
        type: "erc1155",
      }
    }
  }

  // Check if the token is an NFT
  // FIXME: This is a temporary solution until we have a better way to identify NFTs
  if (nftContracts.includes(tokenAddress)) {
    return {
      address: tokenAddress,
      name: "NFT",
      symbol: "NFT",
      decimals: 0,
      networkId: networkId,
      image: undefined,
      type: "erc721",
      tokenId,
    }
  }

  return undefined
}

export const getTokenImageOrURI = (
  details: TokenDetails,
): { image?: string; tokenURI?: string } => {
  if (details.tokenType === "erc721" && details.tokenURI) {
    const uri = parseIPFSUri(details.tokenURI)

    return { tokenURI: uri, image: undefined }
  }

  return { image: details.tokenURI ?? undefined, tokenURI: undefined }
}

export const transferAffectsBalance = (
  t: TransactionSimulationTransfer,
  account: Account,
): boolean => {
  return t.from === account.address || t.to === account.address
}
