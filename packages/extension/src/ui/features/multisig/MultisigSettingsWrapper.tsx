import { BarBackButton, NavigationContainer } from "@argent/x-ui"
import type { FC, PropsWithChildren, ReactNode } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"

export const MultisigSettingsWrapper: FC<
  PropsWithChildren & { goBack?: () => void }
> = ({ children, goBack }: { children?: ReactNode; goBack?: () => void }) => {
  const navigate = useNavigate()
  const account = useRouteWalletAccount()

  const onClose = useCallback(() => {
    if (goBack) {
      goBack()
    } else {
      navigate(-1)
    }
  }, [navigate, goBack])

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={account?.name}
      >
        {children}
      </NavigationContainer>
    </>
  )
}
