import { ModalDialog, P4, icons } from "@argent/ui"
import { ComponentProps } from "react"

const { CopyIcon } = icons

export default {
  component: ModalDialog,
}

const Default = {
  render: (props: ComponentProps<typeof ModalDialog>) => {
    return <ModalDialog {...props} isOpen></ModalDialog>
  },
}

export const Example = {
  ...Default,
  args: {
    title: "Example",
    children: (
      <P4>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl,
        diam iaculis porttitor.,
      </P4>
    ),
  },
  argTypes: {
    onClose: { action: "onClose" },
  },
}
