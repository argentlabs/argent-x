import { formatTruncatedAddress } from "@argent/x-shared"

import type { AllowPromise } from "../../../../storage/types"
import type { BaseWalletAccount } from "../../../../wallet.model"
import {
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransferTransaction,
  isTokenTransferTransaction,
} from "../is"
import type { TransformedTransaction } from "../type"

type GetAddressName = (
  account: BaseWalletAccount,
) => AllowPromise<string | undefined>

export interface GetTransactionSubtitleProps {
  transactionTransformed: TransformedTransaction
  networkId: string
  getAddressName?: GetAddressName
}

export async function getTransactionSubtitle({
  transactionTransformed,
  networkId,
  getAddressName,
}: GetTransactionSubtitleProps) {
  const { action, dapp } = transactionTransformed
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)

  if (isTransfer || isNFTTransfer) {
    const titleShowsTo =
      (isTransfer || isNFTTransfer) &&
      (action === "SEND" || action === "TRANSFER")
    const { toAddress, fromAddress } = transactionTransformed
    const address = titleShowsTo ? toAddress : fromAddress
    const accountName =
      (await getAddressName?.({
        address,
        networkId,
      })) ?? formatTruncatedAddress(address)
    const subtitle = `${titleShowsTo ? "To:" : "From:"} ${accountName}`
    return subtitle
  }

  if (dapp) {
    return dapp.title
  }

  if (isDeclareContract) {
    return transactionTransformed.classHash
  }

  if (isDeployContract) {
    return transactionTransformed.contractAddress
  }
}
