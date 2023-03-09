import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, PropsWithChildren, ReactNode, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useReturnTo } from "../../routes"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"

export const MultisigSettingsWrapper: FC<PropsWithChildren> = ({
  children,
}: {
  children?: ReactNode
}) => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { accountNames } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })

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
