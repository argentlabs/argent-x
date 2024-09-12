import { iconsDeprecated } from "@argent/x-ui"
import { ComponentProps, FC } from "react"

const { CheckboxActiveIcon, CheckboxDefaultIcon } = iconsDeprecated

type SettingsRadioIconProps = ComponentProps<typeof CheckboxActiveIcon> & {
  checked: boolean
}

export const SettingsRadioIcon: FC<SettingsRadioIconProps> = ({
  checked,
  ...rest
}) => {
  if (checked) {
    return <CheckboxActiveIcon fontSize="3xl" color="primary.500" {...rest} />
  }
  return <CheckboxDefaultIcon fontSize="3xl" color="text-secondary" {...rest} />
}
