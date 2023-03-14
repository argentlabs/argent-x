import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, PropsWithChildren, ReactNode, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useReturnTo } from "../../routes"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useRouteAccount } from "../shield/useRouteAccount"

export const MultisigSettingsWrapper: FC<PropsWithChildren> = ({
  children,
}: {
  children?: ReactNode
}) => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { accountNames } = useAccountMetadata()
  const account = useRouteAccount()

  const accountName = account
    ? getAccountName(account, accountNames)
    : "Not found"

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

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
