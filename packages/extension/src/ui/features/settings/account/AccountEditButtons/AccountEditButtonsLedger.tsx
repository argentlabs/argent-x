import { BinSecondaryIcon, InfoCircleSecondaryIcon } from "@argent/x-ui/icons"
import { AlertDialog, ButtonCell, P3, SpacerCell } from "@argent/x-ui"

import { Flex, useDisclosure } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import type { FC } from "react"
import { accountService } from "../../../../../shared/account/service"
import { routes } from "../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { clientAccountService } from "../../../../services/account"

export const AccountEditButtonsLedger: FC<{
  account: WalletAccount | undefined
}> = ({ account }) => {
  const {
    isOpen: isAlertDialogOpen,
    onOpen: onAlertDialogOpen,
    onClose: onAlertDialogClose,
  } = useDisclosure()

  const navigate = useNavigate()

  const onUserConfirmRemove = async () => {
    if (account) {
      await accountService.removeById(account.id)
      await clientAccountService.autoSelectAccountOnNetwork(account.networkId)
      onAlertDialogClose()
      navigate(routes.accounts())
    }
  }

  return (
    <>
      <AlertDialog
        isOpen={isAlertDialogOpen}
        title={"Are you sure?"}
        message={"This will remove the account from Argent X"}
        destroyTitle={"Remove account"}
        onDestroy={() => void onUserConfirmRemove()}
        onCancel={onAlertDialogClose}
      />
      <ButtonCell
        colorScheme={"neutrals-danger"}
        onClick={onAlertDialogOpen}
        rightIcon={<BinSecondaryIcon />}
      >
        Remove account
      </ButtonCell>
      <SpacerCell />
      <Flex
        w="full"
        alignItems="center"
        p={3}
        gap={2}
        color="text-secondary-web"
        rounded="lg"
        shadow="border-stroke-focused"
      >
        <InfoCircleSecondaryIcon fontSize="base" flexShrink={0} />
        <P3>
          Ledger accounts aren’t recoverable from an Argent X seed phrase. You
          need to add them again
        </P3>
      </Flex>
    </>
  )
}
