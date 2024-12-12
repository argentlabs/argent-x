import { BarIconButton, icons } from "@argent/x-ui"
import type { ComponentProps, FC } from "react"

import { useView } from "../../views/implementation/react"
import { useOnSettingsNavigate } from "../accounts/useOnSettingsNavigate"
import { selectedAccountView } from "../../views/account"

const { SettingsSecondaryIcon } = icons

export const SettingsBarIconButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  const account = useView(selectedAccountView)
  const onSettings = useOnSettingsNavigate(account)

  return (
    <BarIconButton
      aria-label="Show settings"
      onClick={() => void onSettings()}
      colorScheme="default"
      {...props}
    >
      <SettingsSecondaryIcon />
    </BarIconButton>
  )
}
