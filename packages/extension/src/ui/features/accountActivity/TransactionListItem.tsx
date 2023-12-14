import { H6, P4 } from "@argent/ui"
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

export interface TransactionListItemProps extends CustomButtonCellProps {
  transactionTransformed: TransformedTransaction
  network: Network
  highlighted?: boolean
  children?: ReactNode | ReactNode[]
  txHash: string
  isCancelled?: boolean
}

export const TransactionListItem: FC<TransactionListItemProps> = ({
  transactionTransformed,
  network,
  highlighted,
  txHash,
  isCancelled,
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

  const subtitle = useMemo(() => {
    if (isTransfer || isNFTTransfer) {
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
            {isCancelled && <> ∙ </>}
          </P4>

          {isCancelled && (
            <P4
              color="error.500"
              fontWeight="semibold"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              Cancelled
            </P4>
          )}
        </Flex>
      )
    }
    if (dapp) {
      return <>{dapp.title}</>
    }
    if (isDeclareContract) {
      return <>{transactionTransformed.classHash}</>
    }
    if (isDeployContract) {
      return <>{transactionTransformed.contractAddress}</>
    }
    return null
  }, [
    isTransfer,
    isNFTTransfer,
    dapp,
    isDeclareContract,
    isDeployContract,
    action,
    transactionTransformed,
    network.id,
    isCancelled,
  ])

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
        <SwapTransactionIcon transaction={transactionTransformed} size={9} />
      )
    }
    return (
      <TransactionIcon
        transaction={transactionTransformed}
        size={9}
        isCancelled={isCancelled}
      />
    )
  }, [isNFT, isSwap, transactionTransformed, isCancelled, network.id])

  const accessory = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove) {
      return <TransferAccessory transaction={transactionTransformed} />
    }
    if (isSwap) {
      return <SwapAccessory transaction={transactionTransformed} />
    }
    return null
  }, [isTransfer, isTokenMint, isTokenApprove, isSwap, transactionTransformed])

  return (
    <CustomButtonCell
      data-tx-hash={txHash}
      highlighted={highlighted}
      onClick={(e) => !isCancelled && onClick?.(e)}
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
          {subtitle}
        </Flex>
      </Flex>
      {accessory}
      {children}
    </CustomButtonCell>
  )
}
