import { RadioEmptyIcon, SuccessPrimaryIcon } from "@argent/x-ui/icons"
import type { ComponentProps, FC } from "react"

type SettingsRadioIconProps = ComponentProps<typeof SuccessPrimaryIcon> & {
  checked: boolean
}

export const SettingsRadioIcon: FC<SettingsRadioIconProps> = ({
  checked,
  ...rest
}) => {
  if (checked) {
    return <SuccessPrimaryIcon fontSize="3xl" color="icon-brand" {...rest} />
  }
  return <RadioEmptyIcon fontSize="3xl" color="text-secondary" {...rest} />
}
