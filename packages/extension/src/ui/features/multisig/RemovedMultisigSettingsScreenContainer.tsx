import { BarBackButton, NavigationContainer } from "@argent/x-ui"
import { useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { hideMultisig } from "../../../shared/multisig/utils/baseMultisig"
import { useReturnTo, useRouteAccountId } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { multisigByIdView } from "./multisig.state"
import { RemovedMultisigSettingsScreen } from "./RemovedMultisigSettingsScreen"
import { useView } from "../../views/implementation/react"
import { clientAccountService } from "../../services/account"

export const RemovedMultisigSettingsScreenContainer: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const accountId = useRouteAccountId()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const multisig = useView(multisigByIdView(accountId))
  const accountName = multisig ? multisig.name : "Unnamed Multisig"

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  const {
    isOpen: isHideMultisigModalOpen,
    onOpen: onHideMultisigModalOpen,
    onClose: onHideMultisigModalClose,
  } = useDisclosure()

  const onHideConfirm = useCallback(async () => {
    if (multisig) {
      await hideMultisig(multisig)
      const account = await clientAccountService.autoSelectAccountOnNetwork(
        currentNetwork.id,
      )
      onHideMultisigModalClose()
      if (account) {
        navigate(routes.accounts())
      } else {
        /** no accounts, return to empty account screen */
        navigate(routes.accountTokens())
      }
    }
  }, [currentNetwork.id, multisig, navigate, onHideMultisigModalClose])

  if (!multisig) {
    throw new Error("Multisig not found")
  }

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onClose} />}
      title={accountName}
    >
      <RemovedMultisigSettingsScreen
        accountName={accountName}
        isHideMultisigModalOpen={isHideMultisigModalOpen}
        onHideConfirm={onHideConfirm}
        onHideMultisigModalClose={onHideMultisigModalClose}
        onHideMultisigModalOpen={onHideMultisigModalOpen}
        multisig={multisig}
      />
    </NavigationContainer>
  )
}
