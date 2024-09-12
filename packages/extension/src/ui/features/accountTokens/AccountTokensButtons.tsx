import { Button, iconsDeprecated } from "@argent/x-ui"
import { Flex, SimpleGrid, Skeleton } from "@chakra-ui/react"
import { FC } from "react"

import { MultisigHideModal } from "../multisig/MultisigHideModal"

const { AddIcon, SendIcon, HideIcon, PieChartIcon } = iconsDeprecated

export interface AccountTokensButtonsProps {
  onAddFunds: () => void
  showAddFundsButton: boolean
  showSendButton: boolean
  onSend: () => void
  showHideMultisigButton?: boolean
  onHideMultisigModalOpen: () => void
  isHideMultisigModalOpen: boolean
  onHideMultisigModalClose: () => void
  onHideConfirm: () => Promise<void>
  portfolioUrl: string | null
  buttonColumnCount: number
}

export const AccountTokensButtonsSkeleton: FC = () => {
  return (
    <SimpleGrid w="full" columns={3} spacing={2} px={4}>
      <Skeleton rounded="full" h={10} />
      <Skeleton rounded="full" h={10} />
      <Skeleton rounded="full" h={10} />
    </SimpleGrid>
  )
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  onAddFunds,
  showAddFundsButton,
  showSendButton,
  onSend,
  showHideMultisigButton,
  onHideMultisigModalOpen,
  isHideMultisigModalOpen,
  onHideMultisigModalClose,
  onHideConfirm,
  portfolioUrl,
  buttonColumnCount,
}) => {
  return (
    <Flex gap={2} mx={"auto"} flexDirection="column">
      {buttonColumnCount && (
        <SimpleGrid columns={buttonColumnCount} spacing={2} mx={4}>
          {showAddFundsButton && (
            <Button
              onClick={onAddFunds}
              colorScheme={"secondary"}
              size="sm"
              leftIcon={<AddIcon />}
            >
              Fund
            </Button>
          )}
          {showSendButton && (
            <Button
              onClick={onSend}
              colorScheme={"secondary"}
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
              colorScheme={"secondary"}
              size="sm"
              leftIcon={<PieChartIcon />}
            >
              Portfolio
            </Button>
          )}
        </SimpleGrid>
      )}
      {showHideMultisigButton && (
        <Button
          onClick={onHideMultisigModalOpen}
          colorScheme={"secondary"}
          size="sm"
          leftIcon={<HideIcon />}
          mx={"auto"}
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
