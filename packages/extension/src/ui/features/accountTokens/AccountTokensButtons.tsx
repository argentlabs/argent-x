import { Button, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"

import { Account } from "../accounts/Account"
import { MultisigHideModal } from "../multisig/MultisigDeleteModal"

const { AddIcon, SendIcon, PluginIcon, HideIcon } = icons

export interface AccountTokensButtonsProps {
  account: Account
  onAddFunds: () => void
  showAddFundsButton: boolean
  showSendButton: boolean
  onSend: () => void
  onPlugins: () => void
  showHideMultisigButton?: boolean
  onHideMultisigModalOpen: () => void
  isHideMultisigModalOpen: boolean
  onHideMultisigModalClose: () => void
  onHideConfirm: () => Promise<void>
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  account,
  onAddFunds,
  showAddFundsButton,
  showSendButton,
  onSend,
  onPlugins,
  showHideMultisigButton,
  onHideMultisigModalOpen,
  isHideMultisigModalOpen,
  onHideMultisigModalClose,
  onHideConfirm,
}) => {
  return (
    <Flex gap={2} mx={"auto"}>
      <SimpleGrid columns={showSendButton ? 2 : 1} spacing={2}>
        {showAddFundsButton && (
          <Button
            onClick={onAddFunds}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<AddIcon />}
          >
            Add funds
          </Button>
        )}
        {showSendButton && (
          <Button
            onClick={onSend}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        )}
      </SimpleGrid>
      {account?.type === "plugin" && (
        <Button onClick={onPlugins} colorScheme={"tertiary"} size="sm">
          <PluginIcon />
        </Button>
      )}
      {showHideMultisigButton && (
        <Button
          onClick={onHideMultisigModalOpen}
          colorScheme={"tertiary"}
          size="sm"
          leftIcon={<HideIcon />}
        >
          Hide account
        </Button>
      )}

      <MultisigHideModal
        onClose={onHideMultisigModalClose}
        isOpen={isHideMultisigModalOpen}
        onHide={onHideConfirm}
        multisigType="active"
      />
    </Flex>
  )
}
