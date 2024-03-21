import { Button, icons } from "@argent/x-ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"

import { Account } from "../accounts/Account"
import { MultisigHideModal } from "../multisig/MultisigHideModal"

const { AddIcon, SendIcon, PluginIcon, HideIcon, PieChartIcon } = icons

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
  portfolioUrl: string | null
  buttonColumnCount: number
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
  portfolioUrl,
  buttonColumnCount,
}) => {
  return (
    <Flex gap={2} mx={"auto"}>
      <SimpleGrid columns={buttonColumnCount} spacing={2} mx={4}>
        {showAddFundsButton && (
          <Button
            onClick={onAddFunds}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<AddIcon />}
          >
            Fund
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
        {portfolioUrl && showSendButton && (
          <Button
            as={"a"}
            href={portfolioUrl}
            target="_blank"
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<PieChartIcon />}
          >
            Portfolio
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
