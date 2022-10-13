import { FC } from "react"
import styled from "styled-components"

import {
  KnownDapp,
  getKnownDappForContractAddress,
} from "../../../../../shared/knownDapps"
import {
  Field,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../../components/Fields"
import { DappIcon } from "../../connectDapp/DappIcon"
import { useDappDisplayAttributes } from "../../connectDapp/useDappDisplayAttributes"

const DappFieldValue = styled(FieldValue)`
  margin-left: 8px;
`

const DappIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  flex-shrink: 0;
`

export const MaybeDappContractField: FC<{ contractAddress: string }> = ({
  contractAddress,
}) => {
  const knownContract = getKnownDappForContractAddress(contractAddress)
  if (!knownContract) {
    return null
  }
  return <DappContractField knownContract={knownContract} />
}

export const DappContractField: FC<{
  knownContract: Omit<KnownDapp, "contracts">
  useDappDisplayAttributesImpl?: typeof useDappDisplayAttributes
}> = ({
  knownContract,
  useDappDisplayAttributesImpl = useDappDisplayAttributes,
}) => {
  const host = knownContract.hosts[0]
  const dappDisplayAttributes = useDappDisplayAttributesImpl(host)
  return (
    <Field>
      <FieldKey>Dapp</FieldKey>
      <DappFieldValue>
        <DappIconContainer>
          <DappIcon
            host={host}
            useDappDisplayAttributesImpl={useDappDisplayAttributesImpl}
          />
        </DappIconContainer>
        <LeftPaddedField>
          {dappDisplayAttributes?.title || host}
        </LeftPaddedField>
      </DappFieldValue>
    </Field>
  )
}
