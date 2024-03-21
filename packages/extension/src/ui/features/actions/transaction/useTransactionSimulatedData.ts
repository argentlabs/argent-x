import { addressSchema, isEqualAddress } from "@argent/x-shared"
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

import {
  ApiTransactionBulkSimulationResponse,
  TransactionSimulationApproval,
} from "./../../../../shared/transactionSimulation/types"
import {
  ApiTransactionSimulationResponse,
  TokenDetails,
  TransactionSimulationTransfer,
} from "../../../../shared/transactionSimulation/types"
import { useContractAddresses } from "../../accountNfts/nfts.state"
import { Account } from "../../accounts/Account"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useTokensRecord } from "../../accountTokens/tokens.state"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { bigDecimal } from "@argent/x-shared"
import { EstimatedFees } from "../../../../shared/transactionSimulation/fees/fees.model"
import { Token } from "../../../../shared/token/__new/types/token.model"
import {
  estimatedFeesToMaxFeeTotal,
  estimatedFeesToTotal,
  getEstimatedFeeFromBulkSimulation,
} from "../../../../shared/transactionSimulation/utils"
import { num } from "starknet"

interface CommonSimulationData {
  token: Token
  amount: bigint
  usdValue?: string
}

interface ApprovalSimulationData extends CommonSimulationData {
  owner: string
  spender: string
}

interface Recipient {
  address: string
  amount: bigint
  usdValue?: string
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
  return partition(transfers, (t) => t.amount > 0n)
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

export const useSimulationPreprocessor = (
  transactionSimulations: ApiTransactionBulkSimulationResponse,
) => {
  return useMemo(() => {
    if (!Array.isArray(transactionSimulations)) {
      return {
        approvals: [],
        transfers: [],
      }
    }
    return transactionSimulations.reduce<
      Omit<ApiTransactionSimulationResponse, "feeEstimation">
    >(
      (acc, t) => {
        return {
          approvals: [...acc.approvals, ...t.approvals],
          transfers: [...acc.transfers, ...t.transfers],
        }
      },
      {
        approvals: [],
        transfers: [],
      },
    )
  }, [transactionSimulations])
}

export const useAggregatedTxFeesData = (
  transactionSimulation?: ApiTransactionBulkSimulationResponse,
  providedFee?: EstimatedFees,
) => {
  const fee = transactionSimulation
    ? getEstimatedFeeFromBulkSimulation(transactionSimulation)
    : providedFee

  const totalFee = fee ? num.toHex(estimatedFeesToTotal(fee)) : undefined
  const totalMaxFee = fee
    ? num.toHex(estimatedFeesToMaxFeeTotal(fee))
    : undefined

  return {
    fee,
    totalFee,
    totalMaxFee,
  }
}

const DEFAULT_TRANSACTION_SIMULATION = [
  {
    approvals: [],
    transfers: [],
    feeEstimation: {
      gasPrice: 0,
      gasUsage: 0,
      overallFee: 0,
      unit: "WEI" as const,
      maxFee: 0,
    },
  },
]

export const useAggregatedSimData = (
  transactionSimulations: ApiTransactionBulkSimulationResponse = DEFAULT_TRANSACTION_SIMULATION,
) => {
  const network = useCurrentNetwork()
  const account = useSelectedAccount()

  // Need to clean hex because the API returns addresses with unpadded 0s
  const erc20TokensRecord = useTokensRecord({ cleanHex: true })
  const nftContracts = useContractAddresses()

  const { transfers, approvals } = useSimulationPreprocessor(
    transactionSimulations,
  )

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

    const ZERO = 0n
    const ONE = 1n

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
              amount: BigInt(a.value ?? 1),
              usdValue: a.usdValue ?? undefined,
            }))
            .filter((a) => a.owner === account?.address) ?? []

        if (!isEmpty(approvalsForTokens) && noTransfers) {
          return {
            ...acc,
            [key]: {
              token: approvalsForTokens[0].token,
              approvals,
              amount: ZERO,
              usdValue: "0",
              recipients: [],
              safe: false,
            },
          }
        }

        const amount = transfers.reduce<bigint>((acc, t) => {
          const isTokenTranfer = checkIsTokenTransfer(t)
          if (isTokenTranfer && isEqualAddress(t.from, account?.address)) {
            return acc - BigInt(t.value ?? ONE) // This works because ERC721 tokens have value undefined and the amount is always 1
          }

          return acc + BigInt(t.value ?? ONE)
        }, ZERO)

        const usdValueBigInt = transfers.reduce<bigint>((acc, t) => {
          if (!t.usdValue) {
            return acc
          }
          const isTokenTranfer = checkIsTokenTransfer(t)

          if (isTokenTranfer && t.from === account?.address) {
            return acc - bigDecimal.parseCurrency(t.usdValue).value
          }

          return acc + bigDecimal.parseCurrency(t.usdValue).value
        }, ZERO)

        const usdValue = bigDecimal.formatCurrency(usdValueBigInt)

        const recipients = transfers.reduce<Recipient[]>((acc, t) => {
          const amount = BigInt(t.value ?? 1)

          const negated = -amount
          const isTokenTranfer = checkIsTokenTransfer(t)
          if (!isTokenTranfer) {
            return []
          }

          return [
            ...acc,
            {
              address: t.to,
              amount: isEqualAddress(t.to, account?.address) ? amount : negated,
              usdValue: t.usdValue ?? undefined,
            },
          ]
        }, [])

        const totalApprovalAmount = approvals.reduce<bigint>(
          (acc, a) => acc + a.amount,
          ZERO,
        )

        const safe =
          totalApprovalAmount <= bigDecimal.absBigInt(amount) && !noTransfers

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
      address: addressSchema.parse(tokenAddress),
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
      address: addressSchema.parse(tokenAddress),
      name: "NFT",
      symbol: "NFT",
      decimals: 0,
      networkId: networkId,
      iconUrl: undefined,
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
