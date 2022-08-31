import { BigNumber } from "ethers"
import { FC, useMemo, useState } from "react"
import styled from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Network } from "../../../shared/network"
import { Token } from "../../../shared/token/type"
import { entryPointToHumanReadable } from "../../../shared/transactions"
import { CopyIconButton } from "../../components/CopyIconButton"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  SectionHeader,
} from "../../components/Fields"
import { TransactionUnknownInline } from "../../components/Icons/TransactionUnknownInline"
import { formatTruncatedAddress } from "../../services/addresses"
import { formatDateTime } from "../../services/dates"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
import { AccountAddressField } from "../actions/transaction/fields/AccountAddressField"
import { DappContractField } from "../actions/transaction/fields/DappContractField"
import { FeeField } from "../actions/transaction/fields/FeeField"
import { ParameterField } from "../actions/transaction/fields/ParameterField"
import { TokenField } from "../actions/transaction/fields/TokenField"
import { TransactionDetailWrapper } from "./TransactionDetailWrapper"
import {
  isNFTTransaction,
  isSwapTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "./transform/is"
import { TransformedTransaction } from "./transform/type"
import { ExpandableFieldGroup } from "./ui/ExpandableFieldGroup"
import { NFTTitle } from "./ui/NFTTitle"
import { TransactionCallDataBottomSheet } from "./ui/TransactionCallDataBottomSheet"
import { TransactionIcon } from "./ui/TransactionIcon"
import { TransferTitle } from "./ui/TransferTitle"

const StyledTransactionDetailWrapper = styled(TransactionDetailWrapper)`
  position: relative;
`

const MainTransactionIconContainer = styled.div`
  margin-bottom: 8px;
`

const Date = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
`

const TitleAddressContainer = styled.div`
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
`

const TitleAddressPrefix = styled.div`
  margin-right: 8px;
`

const TitleAddress = styled.div`
  font-weight: 600;
`

const StyledCopyIconButton = styled(CopyIconButton)`
  position: relative;
  left: 12px;
`

const TransactionIconContainer = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text2};
  line-height: 1;
  width: 1em;
  height: 1em;
`

const HyperlinkText = styled.div`
  text-decoration: underline;
`

export interface IExplorerTransactionDetail {
  explorerTransaction: IExplorerTransaction
  explorerTransactionTransformed: TransformedTransaction
  network: Network
  tokensByNetwork: Token[]
}

export const ExplorerTransactionDetail: FC<IExplorerTransactionDetail> = ({
  explorerTransaction,
  explorerTransactionTransformed,
  network,
  tokensByNetwork,
}) => {
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const { action, date, displayName, actualFee, dapp } =
    explorerTransactionTransformed
  const isRejected = explorerTransaction.status === "REJECTED"
  const isTransfer = isTokenTransferTransaction(explorerTransactionTransformed)
  const isNFT = isNFTTransaction(explorerTransactionTransformed)
  const isSwap = isSwapTransaction(explorerTransactionTransformed)
  const isTokenMint = isTokenMintTransaction(explorerTransactionTransformed)
  const title = useMemo(() => {
    if (isTransfer || isTokenMint) {
      const { amount, tokenAddress } = explorerTransactionTransformed
      return (
        <TransferTitle
          action={action}
          amount={amount}
          tokenAddress={tokenAddress}
          fallback={displayName}
        />
      )
    } else if (isNFT) {
      const { contractAddress, tokenId } = explorerTransactionTransformed
      /** ERC721 */
      return (
        <NFTTitle
          contractAddress={contractAddress}
          tokenId={tokenId}
          networkId={network.id}
          fallback={displayName}
        />
      )
    }
    return displayName
  }, [
    action,
    displayName,
    explorerTransactionTransformed,
    isNFT,
    isTokenMint,
    isTransfer,
    network.id,
  ])
  const additionalFields = useMemo(() => {
    if (isTransfer) {
      const { fromAddress, toAddress } = explorerTransactionTransformed
      return (
        <>
          <AccountAddressField
            title="From"
            accountAddress={fromAddress}
            networkId={network.id}
          />
          <AccountAddressField
            title="To"
            accountAddress={toAddress}
            networkId={network.id}
          />
        </>
      )
    }
    if (isSwap) {
      const { fromTokenAddress, toTokenAddress, fromAmount, toAmount } =
        explorerTransactionTransformed
      const negativeFromAmount = BigNumber.from(0).sub(fromAmount)
      return (
        <>
          <TokenField
            label="Sold"
            amount={negativeFromAmount}
            contractAddress={fromTokenAddress}
            tokensByNetwork={tokensByNetwork}
          />
          <TokenField
            label="For"
            amount={toAmount}
            contractAddress={toTokenAddress}
            tokensByNetwork={tokensByNetwork}
          />
        </>
      )
    }
    return null
  }, [
    explorerTransactionTransformed,
    isSwap,
    isTransfer,
    network.id,
    tokensByNetwork,
  ])
  const titleShowsTo =
    isTransfer && (action === "SEND" || action === "TRANSFER")
  const titleShowsFrom = isTransfer && action === "RECEIVE"
  const displayContractAddress = formatTruncatedAddress(
    explorerTransaction.contractAddress,
  )
  const displayTransactionHash = formatTruncatedAddress(
    explorerTransaction.transactionHash,
  )
  return (
    <StyledTransactionDetailWrapper
      title={
        <>
          {!isNFT && (
            <MainTransactionIconContainer>
              <TransactionIcon
                transaction={explorerTransactionTransformed}
                size={80}
                outline
              />
            </MainTransactionIconContainer>
          )}
          {title}
          {(titleShowsTo || titleShowsFrom) && (
            <TitleAddressContainer>
              <TitleAddressPrefix>
                {titleShowsTo ? "To:" : "From:"}
              </TitleAddressPrefix>
              <TitleAddress>
                <PrettyAccountAddress
                  accountAddress={
                    titleShowsTo
                      ? explorerTransactionTransformed.toAddress
                      : explorerTransactionTransformed.fromAddress
                  }
                  networkId={network.id}
                  size={20}
                />
              </TitleAddress>
            </TitleAddressContainer>
          )}
          <Date>{date ? formatDateTime(date) : "Unknown date"}</Date>
        </>
      }
    >
      <TransactionCallDataBottomSheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        calls={explorerTransaction.calls}
      />
      <ExpandableFieldGroup
        icon={
          <TransactionIcon
            transaction={explorerTransactionTransformed}
            size={40}
          />
        }
        title="Action"
        subtitle={displayName}
      >
        <Field>
          <FieldKey>Contract</FieldKey>
          <FieldValue>
            <StyledCopyIconButton
              size="s"
              copyValue={explorerTransaction.contractAddress}
              variant="transparent"
            >
              {displayContractAddress}
            </StyledCopyIconButton>
          </FieldValue>
        </Field>
        {explorerTransaction.calls && (
          <Field clickable onClick={() => setBottomSheetOpen(true)}>
            <FieldKey>Call data</FieldKey>
            <FieldValue>
              <HyperlinkText>View</HyperlinkText>
            </FieldValue>
          </Field>
        )}
        {!!explorerTransaction.events?.length && (
          <SectionHeader>Event</SectionHeader>
        )}
        {explorerTransaction.events.map((event, index) => {
          const { name, address, parameters } = event
          const displayName = entryPointToHumanReadable(name)
          const displayAddress = formatTruncatedAddress(address)
          return (
            <ExpandableFieldGroup
              icon={
                <TransactionIconContainer>
                  <TransactionUnknownInline />
                </TransactionIconContainer>
              }
              title={displayName}
              key={index}
            >
              <Field>
                <FieldKey>Contract</FieldKey>
                <FieldValue>
                  <StyledCopyIconButton
                    size="s"
                    copyValue={address}
                    variant="transparent"
                  >
                    {displayAddress}
                  </StyledCopyIconButton>
                </FieldValue>
              </Field>
              {parameters.map((parameter, index) => {
                return (
                  <ParameterField
                    key={index}
                    parameter={parameter}
                    networkId={network.id}
                  />
                )
              })}
            </ExpandableFieldGroup>
          )
        })}
      </ExpandableFieldGroup>
      <FieldGroup>
        <Field>
          <FieldKey>Status</FieldKey>
          <FieldValue>{isRejected ? "Failed" : "Complete"}</FieldValue>
        </Field>
        {dapp && <DappContractField knownContract={dapp} />}
        {additionalFields}
        {actualFee && <FeeField fee={actualFee} networkId={network.id} />}
      </FieldGroup>
      <FieldGroup>
        <Field
          clickable
          onClick={() =>
            openVoyagerTransaction(explorerTransaction.transactionHash, network)
          }
        >
          <FieldKey>Transaction ID</FieldKey>
          <FieldValue>
            <HyperlinkText>{displayTransactionHash}</HyperlinkText>
          </FieldValue>
        </Field>
      </FieldGroup>
    </StyledTransactionDetailWrapper>
  )
}
