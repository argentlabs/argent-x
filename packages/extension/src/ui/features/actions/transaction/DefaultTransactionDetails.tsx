import { FC, useCallback, useState } from "react"
import { Call } from "starknet"
import styled from "styled-components"

import { knownContracts } from "../../../../shared/contracts"
import { entryPointToHumanReadable } from "../../../../shared/transactions"
import { CopyTooltip } from "../../../components/CopyTooltip"
import { ExpandableHeightBox } from "../../../components/ExpandableHeightBox"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../../components/Fields"
import {
  ArrowForwardIosIcon,
  ContentCopyIcon,
} from "../../../components/Icons/MuiIcons"
import { formatTruncatedAddress } from "../../../services/addresses"
import { TransactionItemProps } from "./TransactionItem"

const DisclosureIconContainer = styled.div<{ expanded: boolean }>`
  transition: transform 0.2s;
  transform: rotate(${({ expanded }) => (expanded ? "90deg" : "0deg")});
`

const TransactionDetailsField = styled(Field)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionDetailKey = styled(FieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`

const TransactionJson = styled.pre`
  font-weight: normal;
  font-size: 12px;
  line-height: 12px;
  color: ${({ theme }) => theme.text2};
`

export interface IContractIconContainer {
  fileName: string
}

export const ContractIconContainer = styled.div<IContractIconContainer>`
  background-image: ${(props) =>
    `url(../../../../../assets/contract-icons/${props.fileName})`};
  background-size: cover;
  width: 24px;
  height: 24px;
  border-radius: 12px;
`

const LeftPaddedField = styled.div`
  margin-left: 8px;
  text-align: right;
`

export const ContractField: FC<Pick<Call, "contractAddress">> = ({
  contractAddress,
}) => {
  const knownContract = knownContracts[contractAddress]
  if (!knownContract) {
    return null
  }
  return (
    <Field>
      <FieldKey>Dapp</FieldKey>
      <FieldValue>
        <ContractIconContainer
          fileName={knownContract.iconFileName}
        ></ContractIconContainer>
        <LeftPaddedField>{knownContract.name}</LeftPaddedField>
      </FieldValue>
    </Field>
  )
}

export const DefaultTransactionDetails: FC<TransactionItemProps> = ({
  transaction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])
  const displayContractAddress = formatTruncatedAddress(
    transaction.contractAddress,
  )
  const displayTransactionDetails = JSON.stringify(
    transaction.calldata,
    null,
    2,
  )
  return (
    <FieldGroup>
      <Field>
        <FieldKey>
          Contract
          <CopyTooltip message="Copied" copyValue={transaction.contractAddress}>
            <ContentCopyIcon
              style={{ fontSize: 12, marginLeft: "0.5em", cursor: "pointer" }}
            />
          </CopyTooltip>
        </FieldKey>
        <FieldValue>{displayContractAddress}</FieldValue>
      </Field>
      <ContractField contractAddress={transaction.contractAddress} />
      <Field>
        <FieldKey>Action</FieldKey>
        <FieldValue>
          {entryPointToHumanReadable(transaction.entrypoint)}
        </FieldValue>
      </Field>
      <Field clickable onClick={toggleExpanded}>
        <FieldKey>View details</FieldKey>
        <FieldValue>
          <DisclosureIconContainer expanded={expanded}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </DisclosureIconContainer>
        </FieldValue>
      </Field>
      <ExpandableHeightBox expanded={expanded}>
        <TransactionDetailsField>
          <TransactionDetailKey>
            <div>Transaction details</div>
            <CopyTooltip message="Copied" copyValue={displayTransactionDetails}>
              <ContentCopyIcon style={{ fontSize: 12, cursor: "pointer" }} />
            </CopyTooltip>
          </TransactionDetailKey>
          <FieldValue>
            <TransactionJson>{displayTransactionDetails}</TransactionJson>
          </FieldValue>
        </TransactionDetailsField>
      </ExpandableHeightBox>
    </FieldGroup>
  )
}
