import { icons } from "@argent/x-ui"
import type { ComponentProps, FC } from "react"

const { RadioFilledIcon, RadioEmptyIcon } = icons

type SettingsRadioIconProps = ComponentProps<typeof RadioFilledIcon> & {
  checked: boolean
}

export const SettingsRadioIcon: FC<SettingsRadioIconProps> = ({
  checked,
  ...rest
}) => {
  if (checked) {
    return <RadioFilledIcon fontSize="3xl" color="primary.500" {...rest} />
  }
  return <RadioEmptyIcon fontSize="3xl" color="text-secondary" {...rest} />
}
