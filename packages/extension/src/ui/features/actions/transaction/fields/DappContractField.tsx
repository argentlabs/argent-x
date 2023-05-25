import { chakra } from "@chakra-ui/react"
import { FC } from "react"

import { KnownDapp } from "../../../../../shared/knownDapps"
import {
  Field,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../../components/Fields"
import { DappIcon } from "../../connectDapp/DappIcon"
import { useDappDisplayAttributes } from "../../connectDapp/useDappDisplayAttributes"

const DappFieldValue = chakra(FieldValue, {
  baseStyle: { marginLeft: 2 },
})

interface DappContractFieldProps {
  knownContract: Omit<KnownDapp, "contracts">
  useDappDisplayAttributesImpl?: typeof useDappDisplayAttributes
}

export const DappContractField: FC<DappContractFieldProps> = ({
  knownContract,
  useDappDisplayAttributesImpl = useDappDisplayAttributes,
}) => {
  const host = knownContract.hosts[0]
  const dappDisplayAttributes = useDappDisplayAttributesImpl(host)
  return (
    <Field>
      <FieldKey>Dapp</FieldKey>
      <DappFieldValue>
        <DappIcon
          host={host}
          useDappDisplayAttributesImpl={useDappDisplayAttributesImpl}
          size={6}
        />
        <LeftPaddedField>
          {dappDisplayAttributes?.title || host}
        </LeftPaddedField>
      </DappFieldValue>
    </Field>
  )
}
