import useSWR from "swr"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { swapService } from "../../../services/swap"
import { addressSchema } from "@argent/x-shared"

interface IUseSwapQuoteForPay {
  payToken?: Token
  receiveToken?: Token
  payAmount?: bigint
  account?: BaseWalletAccount
}

export function useSwapQuoteForPay({
  payToken,
  receiveToken,
  payAmount = 0n,
  account,
}: IUseSwapQuoteForPay) {
  const {
    data: paySwapQuote,
    isValidating: paySwapQuoteLoading,
    error: paySwapQuoteError,
  } = useSWR(
    [
      "tradeFromPay",
      payToken?.address,
      receiveToken?.address,
      payAmount,
      account?.address,
    ],
    async () => {
      if (!payToken || !receiveToken || !payAmount || !account) return

      const parsedPayTokenAddress = addressSchema.parse(payToken.address)
      const parsedReceiveTokenAddress = addressSchema.parse(
        receiveToken.address,
      )
      const parsedAccountAddress = addressSchema.parse(account.address)

      const trade = await swapService.getSwapQuoteForPay(
        parsedPayTokenAddress,
        parsedReceiveTokenAddress,
        payAmount.toString(),
        parsedAccountAddress,
      )
      return trade
    },
    {
      revalidateOnFocus: true,
      refreshInterval: (RefreshIntervalInSeconds.MEDIUM * 1000) / 2, // 30s
      revalidateIfStale: true,
    },
  )

  return {
    paySwapQuote,
    paySwapQuoteLoading,
    paySwapQuoteError,
  }
}
