import { AlertDialog } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: AlertDialog,
  // argTypes: {
  //   onCancel: { action: "onCancel" },
  //   onDestroy: { action: "onDestroy" },
  //   onConfirm: { action: "onConfirm" },
  // },
}

const Default = {
  render: (props: ComponentProps<typeof AlertDialog>) => {
    return <AlertDialog {...props} isOpen></AlertDialog>
  },
}

export const Cancel = {
  ...Default,
  args: {
    title: "Lorem ipsum",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
  },
  argTypes: {
    onCancel: { action: "onCancel" },
  },
}

export const OK = {
  ...Default,
  args: {
    title: "Lorem ipsum",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    cancelTitle: "OK",
  },
}

export const Allow = {
  ...Default,
  args: {
    title: "Lorem ipsum",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    cancelTitle: "Don’t allow",
    confirmTitle: "Allow",
  },
  argTypes: {
    onCancel: { action: "onCancel" },
    onDestroy: { action: "onDestroy" },
  },
}

export const Destructive = {
  ...Default,
  args: {
    title: "Remove contact",
    message:
      "Are you sure you want to remove this contact from your address book?",
    destroyTitle: "Remove",
  },
  argTypes: {
    onCancel: { action: "onCancel" },
    onConfirm: { action: "onConfirm" },
  },
}
