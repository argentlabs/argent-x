import { SettingsSecondaryIcon } from "@argent/x-ui/icons"
import { BarIconButton } from "@argent/x-ui"
import type { ComponentProps, FC } from "react"

import { useView } from "../../views/implementation/react"
import { useOnSettingsNavigate } from "../accounts/useOnSettingsNavigate"
import { selectedAccountView } from "../../views/account"

export const SettingsBarIconButton: FC<ComponentProps<typeof BarIconButton>> = (
  props,
) => {
  const account = useView(selectedAccountView)
  const onSettings = useOnSettingsNavigate(account)

  return (
    <BarIconButton
      aria-label="Show settings"
      onClick={() => void onSettings()}
      {...props}
    >
      <SettingsSecondaryIcon />
    </BarIconButton>
  )
}
