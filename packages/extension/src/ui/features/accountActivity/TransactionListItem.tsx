import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode, useMemo } from "react"

import { Network } from "../../../shared/network"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
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

export interface TransactionListItemProps {
  transactionTransformed: TransformedTransaction
  network: Network
  highlighted?: boolean
  onClick?: () => void
  children?: ReactNode | ReactNode[]
  txHash: string
}

export const TransactionListItem: FC<TransactionListItemProps> = ({
  transactionTransformed,
  network,
  highlighted,
  children,
  txHash,
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
        <>
          {titleShowsTo ? "To: " : "From: "}
          <PrettyAccountAddress
            accountAddress={titleShowsTo ? toAddress : fromAddress}
            networkId={network.id}
            icon={false}
          />
        </>
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
    dapp,
    isNFTTransfer,
    isDeclareContract,
    isDeployContract,
    action,
    transactionTransformed,
    network.id,
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
    return <TransactionIcon transaction={transactionTransformed} size={9} />
  }, [isNFT, isSwap, transactionTransformed, network.id])

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
    <CustomButtonCell highlighted={highlighted} {...props}>
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
          <P4
            color="neutrals.300"
            fontWeight={"semibold"}
            overflow="hidden"
            textOverflow={"ellipsis"}
          >
            {subtitle}
          </P4>
        </Flex>
      </Flex>
      {accessory}
      {children}
    </CustomButtonCell>
  )
}
