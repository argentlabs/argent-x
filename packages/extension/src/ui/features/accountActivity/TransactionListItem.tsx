import { H6, P4 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode, useMemo } from "react"

import { Network } from "../../../shared/network"
import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import {
  isNFTTransaction,
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../../../shared/activity/utils/transform/is"
import { TransformedTransaction } from "../../../shared/activity/utils/transform/type"
import { NFTImage } from "./ui/NFTImage"
import { SwapAccessory } from "./ui/SwapAccessory"
import { SwapTransactionIcon } from "./ui/SwapTransactionIcon"
import { TransactionIconContainer } from "./ui/TransactionIcon"
import { TransferAccessory } from "./ui/TransferAccessory"
import { ActivityTransactionFailureReason } from "../../../shared/activity/utils/transform/getTransactionFailureReason"
import { lowerCase, upperFirst } from "lodash-es"
import { getTransactionSubtitle } from "../../../shared/activity/utils/transform/transaction/getTransactionSubtitle"
import { addressService } from "../../../shared/address"
import useSWR from "swr"

export interface TransactionListItemProps extends CustomButtonCellProps {
  transactionTransformed: TransformedTransaction
  network: Network
  highlighted?: boolean
  children?: ReactNode | ReactNode[]
  txHash: string
  failureReason?: ActivityTransactionFailureReason
}

export const TransactionListItem: FC<TransactionListItemProps> = ({
  transactionTransformed,
  network,
  highlighted,
  txHash,
  failureReason,
  onClick,
  _active,
  children,
  ...props
}) => {
  const { displayName } = transactionTransformed
  const isNFT = isNFTTransaction(transactionTransformed)
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isSwap = isSwapTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const getAddressName = addressService.getAddressName.bind(this)

  const { data: subtitle } = useSWR([transactionTransformed], async () =>
    getTransactionSubtitle({
      transactionTransformed,
      networkId: network.id,
      getAddressName,
    }),
  )

  const subtitleWithFailureReason = useMemo(() => {
    if (!failureReason) {
      return (
        <Flex align="center">
          <P4
            color="neutrals.300"
            fontWeight="semibold"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {subtitle}
          </P4>
        </Flex>
      )
    }

    return (
      <Flex alignItems="center">
        {subtitle && (
          <>
            {subtitle}
            {<P4 color="neutrals.300"> ∙ </P4>}
          </>
        )}
        <P4
          color="error.500"
          fontWeight="semibold"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {upperFirst(lowerCase(failureReason))}
        </P4>
      </Flex>
    )
  }, [failureReason, subtitle])

  const icon = useMemo(() => {
    if (isNFT) {
      const { contractAddress, tokenId } = transactionTransformed
      return (
        <NFTImage
          contractAddress={contractAddress}
          tokenId={tokenId}
          networkId={network.id}
          display={"flex"}
          flexShrink={0}
          rounded={"lg"}
          width={9}
          height={9}
        />
      )
    }
    if (isSwap) {
      return (
        <SwapTransactionIcon
          transaction={transactionTransformed}
          size={9}
          failureReason={failureReason}
        />
      )
    }
    return (
      <TransactionIconContainer
        transaction={transactionTransformed}
        size={9}
        failureReason={failureReason}
      />
    )
  }, [isNFT, isSwap, transactionTransformed, failureReason, network.id])

  const accessory = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove) {
      return (
        <TransferAccessory
          transaction={transactionTransformed}
          failed={Boolean(failureReason)}
        />
      )
    }
    if (isSwap) {
      return (
        <SwapAccessory
          transaction={transactionTransformed}
          failed={Boolean(failureReason)}
        />
      )
    }
    return null
  }, [
    isTransfer,
    isTokenMint,
    isTokenApprove,
    isSwap,
    transactionTransformed,
    failureReason,
  ])

  const isCancelled = failureReason === "CANCELLED"

  return (
    <CustomButtonCell
      data-tx-hash={txHash}
      highlighted={highlighted}
      onClick={(e) => !isCancelled && onClick?.(e)} // disable navigation to transaction detail if cancelled
      _hover={{ cursor: isCancelled ? "default" : "pointer" }}
      _active={!isCancelled ? _active : {}}
      w="100%"
      {...props}
    >
      {icon}
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            {displayName}
          </H6>
          {subtitleWithFailureReason}
        </Flex>
      </Flex>
      {accessory}
      {children}
    </CustomButtonCell>
  )
}
