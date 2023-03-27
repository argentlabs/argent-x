import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, PropsWithChildren, ReactNode, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useRouteAccount } from "../shield/useRouteAccount"

export const MultisigSettingsWrapper: FC<
  PropsWithChildren & { goBack?: () => void }
> = ({ children, goBack }: { children?: ReactNode; goBack?: () => void }) => {
  const navigate = useNavigate()
  const { accountNames } = useAccountMetadata()
  const account = useRouteAccount()

  const accountName = account
    ? getAccountName(account, accountNames)
    : "Not found"

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
        title={accountName}
      >
        {children}
      </NavigationContainer>
    </>
  )
}
