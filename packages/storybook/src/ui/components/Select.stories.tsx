import { H6, Select, icons } from "@argent/ui"
import { FC, useState } from "react"

const { SendIcon } = icons

const networks = ["Mainnet", "Testnet", "Integration", "Localhost 5050"]

const options = networks.map((network, index) => ({
  label: network,
  value: `network-${index}`,
}))

const componentOptions = networks.map((network, index) => ({
  icon: <SendIcon />,
  label: <H6 color="cyan">{network}</H6>,
  labelSelected: network,
  value: `network-${index}`,
}))

const SelectStory: FC = (props: any) => {
  const [value, setValue] = useState<string | undefined>()
  const onChange = (newValue: string) => setValue(newValue)
  return <Select {...props} value={value} onChange={onChange} />
}

export default {
  component: SelectStory,
}

export const Default = {
  args: {
    placeholder: "Select network",
    options,
  },
}

export const Labelled = {
  args: {
    ...Default.args,
    label: "Network",
  },
}

export const LabelledComponents = {
  args: {
    ...Default.args,
    options: componentOptions,
    label: "Network",
  },
}

export const Disabled = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
}

export const Empty = {
  args: {
    ...Default.args,
    options: [],
    emptyMessage: "No accounts available on this network",
  },
}

export const Invalid = {
  args: {
    ...Default.args,
    isInvalid: true,
  },
}
