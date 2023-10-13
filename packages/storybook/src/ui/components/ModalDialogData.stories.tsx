import { ModalDialogData } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: ModalDialogData,
}

const Default = {
  render: (props: ComponentProps<typeof ModalDialogData>) => {
    return <ModalDialogData {...props} isOpen></ModalDialogData>
  },
}

const data = JSON.stringify(
  [
    "0x07e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    "100000000000000",
    "0",
  ],
  null,
  2,
)

export const CallData = {
  ...Default,
  args: {
    title: "Transaction call data",
    data,
  },
  argTypes: {
    onClose: { action: "onClose" },
  },
}
