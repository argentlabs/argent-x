import { FC, useCallback, useState } from "react"
import styled from "styled-components"

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
  color: #8f8e8c;
`

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
        <FieldKey>Contract</FieldKey>
        <FieldValue>{displayContractAddress}</FieldValue>
      </Field>
      <Field>
        <FieldKey>Action</FieldKey>
        <FieldValue>{transaction.entrypoint}</FieldValue>
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
              <ContentCopyIcon style={{ fontSize: 12 }} />
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
