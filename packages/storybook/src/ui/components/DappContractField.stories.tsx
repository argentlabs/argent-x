import { knownDapps } from "@argent-x/extension/src/shared/knownDapps"
import { FieldGroup } from "@argent-x/extension/src/ui/components/Fields"
import { DappContractField } from "@argent-x/extension/src/ui/features/actions/transaction/fields/DappContractField"
import { ComponentProps } from "react"

export default {
  component: DappContractField,
}

export const Default = {
  render: (props: ComponentProps<typeof DappContractField>) => (
    <FieldGroup>
      <DappContractField {...props}></DappContractField>
    </FieldGroup>
  ),
  args: {
    knownContract: knownDapps[0],
  },
}

export const LongTitle = {
  ...Default,
  args: {
    knownContract: knownDapps[0],
    useDappDisplayAttributesImpl: (_host: string) => {
      return {
        title:
          "Lorem ipsum dolor sit amet, consec tetur adipi scing elit. Lectus nisl, diam iac ulis portt itor.",
        iconUrl: "https://aspect.co/img/company/logo512.png",
      }
    },
  },
}
