import BigNumber from "bignumber.js"
import type { Dictionary } from "lodash"
import {
  flatten,
  groupBy,
  isEmpty,
  orderBy,
  partition,
  reduce,
} from "lodash-es"
import { useMemo } from "react"

import { TransactionSimulationApproval } from "./../../../../shared/transactionSimulation/types"
import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionSimulationResponse,
  TokenDetails,
  TransactionSimulationTransfer,
} from "../../../../shared/transactionSimulation/types"
import { isEqualAddress } from "../../../services/addresses"
import { useAspectContractAddresses } from "./../../accountNfts/aspect.service"
import { Account } from "../../accounts/Account"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useTokensRecord } from "../../accountTokens/tokens.state"
import { useCurrentNetwork } from "../../networks/useNetworks"

interface CommonSimulationData {
  token: Token
  amount: BigNumber
  usdValue?: BigNumber
}

interface ApprovalSimulationData extends CommonSimulationData {
  owner: string
  spender: string
}

interface Recipient {
  address: string
  amount: BigNumber
  usdValue?: BigNumber
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

export type ValidatedTokenTransfer = Omit<
  TransactionSimulationTransfer,
  "details"
> & {
  token: TokenWithType
  usdValue: string | undefined
}

export type ValidatedTokenApproval = Omit<
  TransactionSimulationApproval,
  "details"
> & {
  token: TokenWithType
  usdValue: string | undefined
}

function partitionIncomingOutgoingTransfers(transfers: AggregatedSimData[]) {
  return partition(transfers, (t) => t.amount.isGreaterThan(0))
}

function orderAggregatedSimData(
  simData: AggregatedSimData[],
): AggregatedSimData[] {
  const orderedSimData = orderBy(simData, (t) => t.amount.toString(16), "desc")

  const [erc721Transfers, restTransfers] = partition(
    orderedSimData,
    (t) => t.token.type === "erc721",
  )
  const [erc20Transfers, erc1155Transfers] = partition(
    restTransfers,
    (t) => t.token.type === "erc20",
  )
  const [incomingErc721Transfers, outgoingErc721Transfers] =
    partitionIncomingOutgoingTransfers(erc721Transfers)
  const [incomingErc1155Transfers, outgoingErc1155Transfers] =
    partitionIncomingOutgoingTransfers(erc1155Transfers)
  const [incomingErc20Transfers, outgoingErc20Transfers] =
    partitionIncomingOutgoingTransfers(erc20Transfers)

  return flatten([
    incomingErc721Transfers,
    incomingErc1155Transfers,
    incomingErc20Transfers,
    outgoingErc721Transfers,
    outgoingErc1155Transfers,
    outgoingErc20Transfers,
  ])
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

    // Validate Tokens before grouping them
    // because we need to know the token type to group them

    const transfersWithValidatedTokens: ValidatedTokenTransfer[] =
      filteredTransfers
        .map((t) => {
          const validatedToken = apiTokenDetailsToToken({
            tokenAddress: t.tokenAddress,
            details: t.details,
            erc20TokensRecord,
            nftContracts,
            tokenId: t.tokenId ?? t.value, // For fallback compatibility, we use the value as the tokenId. This will be ignored for ERC20 tokens
            networkId: network.id,
          })

          return {
            token: validatedToken,
            usdValue: t.details?.usdValue ?? undefined,
            ...t,
          }
        })
        .filter((t): t is ValidatedTokenTransfer => Boolean(t.token))

    const approvalsWithValidatedTokens: ValidatedTokenApproval[] = approvals
      .map((a) => {
        const validatedToken = apiTokenDetailsToToken({
          tokenAddress: a.tokenAddress,
          details: a.details,
          erc20TokensRecord,
          nftContracts,
          tokenId: a.tokenId ?? a.value, // For fallback compatibility, we use the value as the tokenId. This will be ignored for ERC20 tokens
          networkId: network.id,
        })

        return {
          token: validatedToken,
          usdValue: a.details?.usdValue ?? undefined,
          ...a,
        }
      })
      .filter((a): a is ValidatedTokenApproval => Boolean(a.token))

    // This is needed to uniquely identify tokens
    // In case of ERC721 and ERC1155, we use the tokenURI because the tokenAddress can be the same for different tokens.
    // For example, tokens from the same collection will have the same tokenAddress and different tokenId
    // But we can use a mixtures of tokenAddress and tokenId to uniquely identify tokens.
    // "tokenAddress/tokenId" will always be unique for an erc721 token

    // In case of ERC20, we use the tokenAddress, which is enough to uniquely identify a token
    const keyForGrouping = (
      t: ValidatedTokenTransfer | ValidatedTokenApproval,
    ) =>
      t.token.type !== "erc20" ? `${t.tokenAddress}/${t.value}` : t.tokenAddress

    const transfersRecord = groupBy(
      transfersWithValidatedTokens,
      keyForGrouping,
    )
    const approvalsRecord = groupBy(
      approvalsWithValidatedTokens,
      keyForGrouping,
    )

    const mergedRecords = groupBy(
      [...transfersWithValidatedTokens, ...approvalsWithValidatedTokens],
      keyForGrouping,
    )

    const ZERO = BigNumber(0)
    const ONE = BigNumber(1)

    return reduce<
      Dictionary<(ValidatedTokenTransfer | ValidatedTokenApproval)[]>,
      Record<string, AggregatedSimData>
    >(
      mergedRecords,
      (acc, _, key) => {
        const approvalsForTokens: ValidatedTokenApproval[] =
          approvalsRecord[key]

        const transfers: ValidatedTokenTransfer[] = transfersRecord[key]

        const noTransfers = isEmpty(transfers)

        const approvals: ApprovalSimulationData[] =
          approvalsForTokens
            ?.map((a) => ({
              token: a.token,
              owner: a.owner,
              spender: a.spender,
              amount: BigNumber(a.value ?? 1),
              usdValue: a.usdValue ? BigNumber(a.usdValue) : undefined,
            }))
            .filter((a) => a.owner === account?.address) ?? []

        if (!isEmpty(approvalsForTokens) && noTransfers) {
          return {
            ...acc,
            [key]: {
              token: approvalsForTokens[0].token,
              approvals,
              amount: ZERO,
              usdValue: ZERO,
              recipients: [],
              safe: false,
            },
          }
        }

        const amount = transfers.reduce<BigNumber>((acc, t) => {
          const isTokenTranfer = checkIsTokenTransfer(t)
          if (isTokenTranfer && t.from === account?.address) {
            return acc.minus(t.value ?? ONE) // This works because ERC721 tokens have value undefined and the amount is always 1
          }

          return acc.plus(t.value ?? ONE)
        }, ZERO)

        const usdValue = transfers.reduce<BigNumber>((acc, t) => {
          if (!t.usdValue) {
            return acc
          }
          const isTokenTranfer = checkIsTokenTransfer(t)

          if (isTokenTranfer && t.from === account?.address) {
            return acc.minus(t.usdValue)
          }

          return acc.plus(t.usdValue)
        }, ZERO)

        const recipients = transfers.reduce<Recipient[]>((acc, t) => {
          const amount = BigNumber(t.value ?? 1)

          const negated = amount.negated()
          const isTokenTranfer = checkIsTokenTransfer(t)
          if (!isTokenTranfer) {
            return []
          }
          return [
            ...acc,
            {
              address: t.to,
              amount: t.to === account?.address ? amount : negated,
              usdValue: t.usdValue ? BigNumber(t.usdValue) : undefined,
            },
          ]
        }, [])

        const totalApprovalAmount = approvals.reduce<BigNumber>(
          (acc, a) => acc.plus(a.amount),
          ZERO,
        )

        const safe = totalApprovalAmount.lte(amount.abs()) && !noTransfers

        return {
          ...acc,
          [key]: {
            token: transfers[0].token,
            approvals,
            amount,
            usdValue,
            recipients,
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

  return useMemo(() => {
    const aggregatedDataValues = Object.values(aggregatedData)

    return orderAggregatedSimData(aggregatedDataValues)
  }, [aggregatedData])
}

function checkIsTokenTransfer(
  transfer: ValidatedTokenTransfer | ValidatedTokenApproval,
): transfer is ValidatedTokenTransfer {
  return "from" in transfer && transfer.from !== undefined
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
  tokenId?: string
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

  // FIXME: This is a temporary solution until we have a better way to identify NFTs
  const isKnownNftContract = nftContracts.some((nft) =>
    isEqualAddress(nft, tokenAddress),
  )

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
    } else if (details.tokenType === "erc721" || isKnownNftContract) {
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
  if (isKnownNftContract) {
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

export const transferAffectsBalance = (
  t: TransactionSimulationTransfer,
  account: Account,
): boolean => {
  return (
    isEqualAddress(t.from, account.address) ||
    isEqualAddress(t.to, account.address)
  )
}
