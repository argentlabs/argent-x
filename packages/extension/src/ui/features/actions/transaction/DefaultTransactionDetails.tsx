import { FC, useCallback, useState } from "react"
import styled from "styled-components"

import { entryPointToHumanReadable } from "../../../../shared/transactions"
import { CopyTooltip } from "../../../components/CopyTooltip"
import { ExpandableHeightBox } from "../../../components/ExpandableHeightBox"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../components/Fields"
import {
  ArrowForwardIosIcon,
  ContentCopyIcon,
} from "../../../components/Icons/MuiIcons"
import { ContractField } from "./fields/ContractField"
import { TransactionDetailsProps } from "./TransactionDetails"

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

export const DefaultTransactionDetails: FC<TransactionDetailsProps> = ({
  transaction,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])
  const displayTransactionDetails = JSON.stringify(
    transaction.calldata,
    null,
    2,
  )
  return (
    <FieldGroup>
      <ContractField contractAddress={transaction.contractAddress} />
      <Field>
        <FieldKey>Action</FieldKey>
        <LeftPaddedField>
          {entryPointToHumanReadable(transaction.entrypoint)}
        </LeftPaddedField>
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
