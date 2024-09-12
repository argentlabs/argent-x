import {
  AlertDialog,
  ButtonCell,
  P4,
  SpacerCell,
  iconsDeprecated,
} from "@argent/x-ui"

import { Flex, useDisclosure } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { FC } from "react"
import { accountService } from "../../../../../shared/account/service"
import { routes } from "../../../../../shared/ui/routes"
import { WalletAccount } from "../../../../../shared/wallet.model"

const { BinIcon, InfoIcon } = iconsDeprecated

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
      await accountService.remove(account)
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
        onDestroy={onUserConfirmRemove}
        onCancel={onAlertDialogClose}
      />
      <ButtonCell
        colorScheme={"neutrals-danger"}
        onClick={onAlertDialogOpen}
        rightIcon={<BinIcon />}
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
        <InfoIcon fontSize="base" flexShrink={0} />
        <P4>
          Ledger accounts aren’t recoverable from an Argent X seed phrase. You
          need to add them again
        </P4>
      </Flex>
    </>
  )
}
