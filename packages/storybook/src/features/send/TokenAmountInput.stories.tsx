import { TokenAmountInput } from "@argent-x/extension/src/ui/features/send/TokenAmountInput"
import { CellStack } from "@argent/ui"
import { ComponentProps, FC, useState } from "react"

import { tokenWithBalance } from "../../tokens"

const Story: FC<ComponentProps<typeof TokenAmountInput>> = (props) => {
  const [value, setValue] = useState(props.value ?? "")
  return (
    <CellStack>
      <TokenAmountInput
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </CellStack>
  )
}

export default {
  component: Story,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    token: tokenWithBalance(400),
    showMaxButton: true,
    leftText: "$123.45",
    rightText: "Balance: 123.45",
  },
}

export const HideMax = {
  args: {
    token: tokenWithBalance(400),
    showMaxButton: false,
    leftText: "$123.45",
    rightText: "Balance: 123.45",
  },
}

export const IsMaxLoading = {
  args: {
    token: tokenWithBalance(400),
    showMaxButton: true,
    isMaxLoading: true,
    leftText: "$123.45",
    rightText: "Balance: 123.45",
  },
}

export const Invalid = {
  args: {
    token: tokenWithBalance(400),
    showMaxButton: false,
    leftText: "$123.45",
    rightText: "Balance: 123.45",
    isInvalid: true,
    value: "123",
  },
}

export const LongValue = {
  args: {
    token: tokenWithBalance(400),
    showMaxButton: false,
    leftText:
      "$123456789012345678901234567890123456789012345678901234567890.45",
    rightText: "Balance: 1234567890123456789012345678901234567890.45",
    value: "12345678901234567890.1234567890",
  },
}
