import { knownDapps } from "@argent-x/extension/src/shared/knownDapps"
import { FieldGroup } from "@argent-x/extension/src/ui/components/Fields"
import { DappContractField } from "@argent-x/extension/src/ui/features/actions/transaction/fields/DappContractField"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/DappContractField",
  component: DappContractField,
} as ComponentMeta<typeof DappContractField>

const Template: ComponentStory<typeof DappContractField> = (props) => (
  <FieldGroup>
    <DappContractField {...props}></DappContractField>
  </FieldGroup>
)

export const Default = Template.bind({})
Default.args = {
  knownContract: knownDapps[0],
}

export const LongTitle = Template.bind({})
LongTitle.args = {
  knownContract: knownDapps[0],
  useDappDisplayAttributesImpl: (_host: string) => {
    return {
      title:
        "Lorem ipsum dolor sit amet, consec tetur adipi scing elit. Lectus nisl, diam iac ulis portt itor.",
      iconUrl: "https://aspect.co/img/company/logo512.png",
    }
  },
}
