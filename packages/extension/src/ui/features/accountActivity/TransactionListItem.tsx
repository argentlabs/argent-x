import { H6, P4 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode, useMemo } from "react"

import { Network } from "../../../shared/network"
import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import {
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransaction,
  isNFTTransferTransaction,
  isProvisionTransaction,
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "./transform/is"
import { TransformedTransaction } from "./transform/type"
import { NFTImage } from "./ui/NFTImage"
import { SwapAccessory } from "./ui/SwapAccessory"
import { SwapTransactionIcon } from "./ui/SwapTransactionIcon"
import { TransactionIcon } from "./ui/TransactionIcon"
import { TransferAccessory } from "./ui/TransferAccessory"
import { PrettyAccountAddressArgentX } from "../accounts/PrettyAccountAddressArgentX"
import { ActivityTransactionFailureReason } from "./getTransactionFailureReason"
import { lowerCase, upperFirst } from "lodash-es"

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
  const { action, displayName, dapp } = transactionTransformed
  const isNFT = isNFTTransaction(transactionTransformed)
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isSwap = isSwapTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)
  const isProvision = isProvisionTransaction(transactionTransformed)

  const subtitle = useMemo(() => {
    if (isTransfer || isNFTTransfer || isProvision) {
      const titleShowsTo =
        (isTransfer || isNFTTransfer) &&
        (action === "SEND" || action === "TRANSFER")
      const { toAddress, fromAddress } = transactionTransformed
      return (
        <Flex align="center">
          <P4
            color="neutrals.300"
            fontWeight="semibold"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {titleShowsTo ? "To: " : "From: "}
            <PrettyAccountAddressArgentX
              accountAddress={titleShowsTo ? toAddress : fromAddress}
              networkId={network.id}
              icon={false}
            />
          </P4>
        </Flex>
      )
    }
    if (dapp) {
      return (
        <P4
          color="neutrals.300"
          fontWeight="semibold"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {dapp.title}
        </P4>
      )
    }
    if (isDeclareContract) {
      return (
        <P4
          color="neutrals.300"
          fontWeight="semibold"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {transactionTransformed.classHash}
        </P4>
      )
    }
    if (isDeployContract) {
      return (
        <P4
          color="neutrals.300"
          fontWeight="semibold"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {transactionTransformed.contractAddress}
        </P4>
      )
    }
    return null
  }, [
    isTransfer,
    isNFTTransfer,
    dapp,
    isDeclareContract,
    isDeployContract,
    isProvision,
    action,
    transactionTransformed,
    network.id,
  ])

  const subtitleWithFailureReason = useMemo(() => {
    if (!failureReason) {
      return subtitle
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
      <TransactionIcon
        transaction={transactionTransformed}
        size={9}
        failureReason={failureReason}
      />
    )
  }, [isNFT, isSwap, transactionTransformed, failureReason, network.id])

  const accessory = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove || isProvision) {
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
    isProvision,
  ])

  const isCancelled = failureReason === "CANCELLED"

  return (
    <CustomButtonCell
      data-tx-hash={txHash}
      highlighted={highlighted}
      onClick={(e) => !isCancelled && onClick?.(e)} // disable navigation to transaction detail if cancelled
      _hover={{ cursor: isCancelled ? "default" : "pointer" }}
      _active={!isCancelled ? _active : {}}
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
