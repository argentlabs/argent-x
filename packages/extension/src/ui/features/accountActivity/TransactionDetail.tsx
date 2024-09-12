import { iconsDeprecated, formatDateTime } from "@argent/x-ui"
import { isString, upperCase } from "lodash-es"
import { FC, useMemo, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import styled, { useTheme } from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Network } from "../../../shared/network"
import {
  Transaction,
  entryPointToHumanReadable,
} from "../../../shared/transactions"
import { CopyIconButton } from "../../components/CopyIconButton"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
  SectionHeader,
} from "../../components/Fields"
import { ContentCopyIcon } from "../../components/Icons/MuiIcons"
import {
  openBlockExplorerAddress,
  openBlockExplorerTransaction,
} from "../../services/blockExplorer.service"
import { PrettyAccountAddressArgentX } from "../accounts/PrettyAccountAddressArgentX"
import { AccountAddressField } from "../actions/transaction/fields/AccountAddressField"
import { DappContractField } from "../actions/transaction/fields/DappContractField"
import { FeeField } from "../actions/transaction/fields/FeeField"
import { ParameterField } from "../actions/transaction/fields/ParameterField"
import { TokenField } from "../actions/transaction/fields/TokenField"
import { TransactionDetailWrapper } from "./TransactionDetailWrapper"
import {
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransaction,
  isNFTTransferTransaction,
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "../../../shared/activity/utils/transform/is"
import { TransformedTransaction } from "../../../shared/activity/utils/transform/type"
import { ExpandableFieldGroup } from "./ui/ExpandableFieldGroup"
import { NFTTitle } from "./ui/NFTTitle"
import { TransactionCallDataBottomSheet } from "./ui/TransactionCallDataBottomSheet"
import { TransactionIconContainer } from "./ui/TransactionIcon"
import { TransferTitle } from "./ui/TransferTitle"
import { useTransactionFees } from "./useTransactionFees"
import { useTransactionNonce } from "./useTransactionNonce"
import { Token } from "../../../shared/token/__new/types/token.model"
import { formatTruncatedAddress, unitToFeeTokenAddress } from "@argent/x-shared"
import { getTransactionStatus } from "../../../shared/transactions/utils"

const { ActivityIcon } = iconsDeprecated

function getErrorMessageFromErrorDump(errorDump?: string) {
  try {
    if (!isString(errorDump)) {
      return undefined
    }
    const errorCode = errorDump.match(/^Error message: (.+)$/im)
    return errorCode?.[1] ?? undefined
  } catch {
    return undefined
  }
}

const StyledTransactionDetailWrapper = styled(TransactionDetailWrapper)`
  position: relative;
`

const MainTransactionIconContainer = styled.div`
  margin-bottom: 8px;
`

const DateContainer = styled.div`
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

const TransactionIconContainerStyled = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text2};
  line-height: 1;
  width: 1em;
  height: 1em;
`

const HyperlinkText = styled.div`
  text-decoration: underline;
`

const TransactionFailedField = styled(Field)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionLogMessage = styled(FieldValue)`
  line-break: anywhere;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
`

const TransactionLogKey = styled(FieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`

export interface ITransactionDetailBase {
  transactionTransformed: TransformedTransaction
  network: Network
  tokensByNetwork: Token[]
}

export interface ITransactionDetail extends ITransactionDetailBase {
  transaction: Transaction
  explorerTransaction?: never
}

export interface IExplorerTransactionDetail extends ITransactionDetailBase {
  transaction?: never
  explorerTransaction: IExplorerTransaction
}

export type TransactionDetailProps =
  | ITransactionDetail
  | IExplorerTransactionDetail

export const TransactionDetail: FC<TransactionDetailProps> = ({
  transaction,
  explorerTransaction,
  transactionTransformed,
  network,
  tokensByNetwork,
}) => {
  const hash = explorerTransaction?.transactionHash || transaction?.hash
  const txFee = useTransactionFees({
    hash,
    transactionTransformed,
    network,
  })
  const txNonce = useTransactionNonce({ hash, network })
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const { action, date, displayName, dapp } = transactionTransformed

  const { finality_status, execution_status } =
    getTransactionStatus(transaction)

  const isReverted =
    upperCase(explorerTransaction?.executionStatus) === "REVERTED" ||
    execution_status === "REVERTED"
  const isRejected =
    upperCase(explorerTransaction?.executionStatus) === "REJECTED" ||
    finality_status === "REJECTED"

  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isNFT = isNFTTransaction(transactionTransformed)
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isSwap = isSwapTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)
  const theme = useTheme()
  const title = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove) {
      const { amount, tokenAddress } = transactionTransformed
      return (
        <TransferTitle
          action={action}
          amount={amount}
          tokenAddress={tokenAddress}
          fallback={displayName}
        />
      )
    } else if (isNFT || isNFTTransfer) {
      const { contractAddress, tokenId } = transactionTransformed
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
    isTransfer,
    isTokenMint,
    isTokenApprove,
    isNFT,
    isNFTTransfer,
    displayName,
    transactionTransformed,
    action,
    network.id,
  ])
  const additionalFields = useMemo(() => {
    if (isTransfer || isNFTTransfer) {
      const { fromAddress, toAddress } = transactionTransformed
      return (
        <>
          {fromAddress && (
            <AccountAddressField
              title="From"
              accountAddress={fromAddress}
              networkId={network.id}
            />
          )}
          {toAddress && (
            <AccountAddressField
              title="To"
              accountAddress={toAddress}
              networkId={network.id}
            />
          )}
        </>
      )
    }
    if (isSwap) {
      const { fromTokenAddress, toTokenAddress, fromAmount, toAmount } =
        transactionTransformed
      const negativeFromAmount = -BigInt(fromAmount)
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
    isTransfer,
    isNFTTransfer,
    isSwap,
    transactionTransformed,
    network.id,
    tokensByNetwork,
  ])

  const titleShowsTo =
    (isTransfer || isNFTTransfer) &&
    (action === "SEND" || action === "TRANSFER")
  const titleShowsFrom = (isTransfer || isNFTTransfer) && action === "RECEIVE"
  const displayContractAddress =
    !!explorerTransaction &&
    explorerTransaction.contractAddress &&
    formatTruncatedAddress(explorerTransaction.contractAddress)
  const displayTransactionHash = !!hash && formatTruncatedAddress(hash)
  const calls = explorerTransaction?.calls || transaction?.meta?.transactions
  const rejectedErrorMessage =
    isRejected &&
    transaction &&
    getErrorMessageFromErrorDump(transaction.failureReason?.error_message)
  return (
    <StyledTransactionDetailWrapper
      scrollContent={transactionTransformed.displayName || "Transaction"}
      title={
        <>
          {!isNFT && (
            <MainTransactionIconContainer>
              <TransactionIconContainer
                transaction={transactionTransformed}
                size={18}
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
                <PrettyAccountAddressArgentX
                  accountAddress={
                    titleShowsTo
                      ? transactionTransformed.toAddress
                      : transactionTransformed.fromAddress
                  }
                  networkId={network.id}
                  size={5}
                />
              </TitleAddress>
            </TitleAddressContainer>
          )}
          <DateContainer>
            {date ? formatDateTime(date) : "Unknown date"}
          </DateContainer>
        </>
      }
    >
      {calls && (
        <TransactionCallDataBottomSheet
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          calls={calls}
        />
      )}
      <ExpandableFieldGroup
        icon={
          <TransactionIconContainer
            transaction={transactionTransformed}
            size={9}
          />
        }
        title="Action"
        subtitle={displayName}
      >
        {displayContractAddress && (
          <Field>
            <FieldKey>Contract</FieldKey>
            <FieldValue>
              <StyledCopyIconButton
                size="s"
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                copyValue={explorerTransaction.contractAddress!}
                variant="transparent"
              >
                {displayContractAddress}
              </StyledCopyIconButton>
            </FieldValue>
          </Field>
        )}
        {calls && (
          <Field clickable onClick={() => setBottomSheetOpen(true)}>
            <FieldKey>Call data</FieldKey>
            <FieldValue>
              <HyperlinkText>View</HyperlinkText>
            </FieldValue>
          </Field>
        )}
        {!!explorerTransaction?.events?.length && (
          <SectionHeader>Event</SectionHeader>
        )}
        {explorerTransaction?.events.map((event, index) => {
          const { name, address, parameters } = event
          const displayName = entryPointToHumanReadable(name)
          const displayAddress = formatTruncatedAddress(address)
          return (
            <ExpandableFieldGroup
              icon={
                <TransactionIconContainerStyled>
                  <ActivityIcon />
                </TransactionIconContainerStyled>
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
              {parameters
                ? parameters.map((parameter, index) => {
                    return (
                      <ParameterField
                        key={index}
                        parameter={parameter}
                        networkId={network.id}
                      />
                    )
                  })
                : null}
            </ExpandableFieldGroup>
          )
        })}
      </ExpandableFieldGroup>
      <FieldGroup>
        <Field>
          <FieldKey>Status</FieldKey>
          <FieldValue>
            {isRejected ? "Failed" : isReverted ? "Reverted" : "Complete"}
          </FieldValue>
        </Field>
        {rejectedErrorMessage && (
          <Field>
            <FieldKey>Reason</FieldKey>
            <LeftPaddedField>{rejectedErrorMessage}</LeftPaddedField>
          </Field>
        )}
        {dapp && <DappContractField knownContract={dapp} />}
        {additionalFields}
        {txFee && (
          <FeeField
            feeTokenAddress={unitToFeeTokenAddress(txFee.unit)}
            fee={txFee.amount}
            networkId={network.id}
          />
        )}
        {txNonce && (
          <Field>
            <FieldKey>Nonce</FieldKey>
            <LeftPaddedField>{txNonce}</LeftPaddedField>
          </Field>
        )}
      </FieldGroup>
      {(isRejected || isReverted) && transaction && (
        <FieldGroup>
          <TransactionFailedField clickable>
            <TransactionLogKey>
              <div>Transaction log</div>
              <CopyTooltip
                message="Copied"
                copyValue={
                  transaction.failureReason?.error_message ||
                  transaction.revertReason ||
                  hash ||
                  ""
                }
              >
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </CopyTooltip>
            </TransactionLogKey>
            <TransactionLogMessage style={{ color: theme.text2 }}>
              {transaction.failureReason?.error_message ||
                transaction.revertReason ||
                "Unknown error"}
            </TransactionLogMessage>
          </TransactionFailedField>
        </FieldGroup>
      )}
      {hash && (
        <FieldGroup>
          <Field
            clickable
            onClick={() => void openBlockExplorerTransaction(hash, network)}
          >
            <FieldKey>Transaction ID</FieldKey>
            <FieldValue>
              <HyperlinkText>{displayTransactionHash}</HyperlinkText>
            </FieldValue>
          </Field>
        </FieldGroup>
      )}
      {isDeployContract && transaction && transaction.meta?.subTitle && (
        <FieldGroup>
          <Field
            clickable={!!transaction.meta?.subTitle}
            onClick={() => {
              if (transaction.meta?.subTitle) {
                void openBlockExplorerAddress(
                  network,
                  transaction.meta?.subTitle,
                )
              }
            }}
          >
            <FieldKey>Deployed contract address</FieldKey>
            <FieldValue>
              <HyperlinkText>
                {formatTruncatedAddress(transaction.meta?.subTitle)}
              </HyperlinkText>
            </FieldValue>
          </Field>
        </FieldGroup>
      )}
      {isDeclareContract && transaction && transaction.meta?.subTitle && (
        <FieldGroup>
          <CopyToClipboard text={transaction.meta?.subTitle}>
            <Field clickable={!!transaction.meta?.subTitle}>
              <FieldKey>Declared contract hash</FieldKey>
              <FieldValue>
                <HyperlinkText>
                  {formatTruncatedAddress(transaction.meta?.subTitle)}
                </HyperlinkText>
              </FieldValue>
            </Field>
          </CopyToClipboard>
        </FieldGroup>
      )}
    </StyledTransactionDetailWrapper>
  )
}
