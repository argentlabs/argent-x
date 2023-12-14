import { NestedAccordion } from "@argent/ui"
import { ComponentProps, FC } from "react"
import {
  unframedSignature,
  testDappSignature,
  dappLandPayload,
} from "@argent-x/extension/src/ui/features/transactionReview/signature/fixtures"

const Story: FC<ComponentProps<typeof NestedAccordion>> = (props) => {
  return <NestedAccordion {...props} />
}

export default {
  component: Story,
}

export const TestDapp = {
  args: {
    json: testDappSignature,
    initiallyExpanded: true,
  },
}

export const DappLand = {
  args: {
    json: dappLandPayload,
    initiallyExpanded: true,
  },
}

export const Unframed = {
  args: {
    json: unframedSignature,
    initiallyExpanded: true,
  },
}

export const Invalid = {
  args: {
    json: undefined,
    initiallyExpanded: true,
  },
}
