import BigNumber from "bignumber.js"
import { Dictionary } from "lodash"
import { groupBy, reduce } from "lodash-es"
import { useMemo } from "react"
import { encode } from "starknet"

import { Token } from "../../../../shared/token/type"
import { useTokensRecord } from "../../../../shared/tokens.state"
import {
  ApiTransactionSimulationResponse,
  TokenDetails,
  TransactionSimulationTransfer,
} from "../../../../shared/transactionSimulation.service"
import { Account } from "../../accounts/Account"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { useCurrentNetwork } from "../../networks/useNetworks"

interface CommonSimulationData {
  token: Token
  amount: BigNumber
  usdValue: number
}

interface ApprovalSimulationData extends CommonSimulationData {
  owner: string
  spender: string
}

interface Recipient {
  address: string
  amount: BigNumber
  usdValue: number
}

interface TransferSimulationData extends CommonSimulationData {
  token: Token
  recipients: Recipient[]
  approvals: ApprovalSimulationData[]
  isSafeTransfer?: boolean
}

export interface IUseTransactionSimulatedData {
  transactionSimulation: ApiTransactionSimulationResponse
}

export const useAggregatedSimData = (
  transactionSimulation: ApiTransactionSimulationResponse,
) => {
  const network = useCurrentNetwork()
  const account = useSelectedAccount()
  const tokensRecord = useTokensRecord()

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
      Record<string, TransferSimulationData>
    >(
      transfersByTokenAddress,
      (acc, transfers, tokenAddress) => {
        const validatedToken = apiTokenDetailsToToken({
          tokenAddress,
          details: transfers[0].details,
          networkId: network.id,
          tokensRecord,
        })

        const approvalsForTokens = approvalsByTokenAddress[tokenAddress]

        const approvals: ApprovalSimulationData[] =
          approvalsForTokens?.map((a) => ({
            token: validatedToken,
            owner: a.owner,
            spender: a.spender,
            amount: new BigNumber(a.value),
            usdValue: parseFloat(a.details.usdValue),
          })) ?? []

        const amount = transfers.reduce<BigNumber>((acc, t) => {
          if (t.from === account?.address) {
            return acc.minus(t.value)
          }

          return acc.plus(t.value)
        }, ZERO)

        const usdValue = transfers.reduce<number>((acc, t) => {
          if (t.from === account?.address) {
            return acc - parseFloat(t.details.usdValue)
          }

          return acc + parseFloat(t.details.usdValue)
        }, 0)

        const recipients = transfers.reduce<Recipient[]>((acc, t) => {
          if (t.to !== account?.address) {
            return [
              ...acc,
              {
                address: t.to,
                amount: new BigNumber(t.value),
                usdValue: parseFloat(t.details.usdValue),
              },
            ]
          }
          return acc
        }, [])

        const totalApprovalAmount = approvals.reduce<BigNumber>(
          (acc, a) => acc.plus(a.amount),
          ZERO,
        )

        const isSafeTransfer = amount.isEqualTo(totalApprovalAmount)

        return {
          ...acc,
          [tokenAddress]: {
            token: validatedToken,
            amount,
            usdValue,
            recipients,
            approvals,
            isSafeTransfer,
          },
        }
      },
      {},
    )
  }, [account, approvals, network.id, tokensRecord, transfers])

  return Object.values(aggregatedData)
}

export function apiTokenDetailsToToken({
  tokenAddress,
  networkId,
  details,
  tokensRecord,
}: {
  tokenAddress: string
  details: TokenDetails
  networkId: string
  tokensRecord: Record<string, Token>
}): Token {
  const paddedAddress = encode.sanitizeHex(tokenAddress)

  // FIXME: Properly handle token address padding
  //   console.log(
  //     "🚀 ~ file: useTransactionSimulatedData.ts:189 ~ paddedAddress",
  //     details.symbol,
  //     paddedAddress,
  //   )

  const token = tokensRecord[paddedAddress]

  if (token) {
    return token
  }

  return {
    address: tokenAddress,
    name: details.name,
    symbol: details.symbol,
    decimals: parseInt(details.decimals),
    networkId: networkId,
    image: undefined,
  }
}

export const transferAffectsBalance = (
  t: TransactionSimulationTransfer,
  account: Account,
) => {
  return t.from === account.address || t.to === account.address
}
