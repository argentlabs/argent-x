import { Button, P4, icons } from "@argent/ui"
import { Box, Circle, Flex, useDisclosure } from "@chakra-ui/react"
import { FC, MouseEvent, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Account } from "starknet"

import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { selectAccount } from "../../services/backgroundAccounts"
import { AccountListItem } from "../accounts/AccountListItem"
import {
  AccountItemIconContainer,
  IAccountListScreenItem,
} from "../accounts/AccountListScreenItem"
import { useRemoveAccountCallback } from "../accounts/accounts.state"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { MultisigDeleteModal } from "./MultisigDeleteModal"

const { MoreIcon, ChevronRightIcon } = icons

export interface IMultisigListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
}

export const MultisigListScreenItem: FC<IAccountListScreenItem> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
}) => {
  const navigate = useNavigate()
  const status = useAccountStatus(account, selectedAccount)
  const originatingHost = useOriginatingHost()
  const accountName = account.name
  const { isOpen: isMenuOpen } = useDisclosure()

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  const removeAccount = useRemoveAccountCallback()

  const isConnected = useIsPreauthorized(originatingHost || "", account)

  const { multisig } = useMultisigInfo(account)

  const onClick = useCallback(async () => {
    await selectAccount(account)

    const navigationRoute = multisig?.needsDeploy
      ? routes.accountTokens()
      : returnTo || routes.accountTokens()

    navigate(navigationRoute)
  }, [account, multisig?.needsDeploy, navigate, returnTo])

  const onOptionsClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      navigate(routes.editAccount(account.address))
    },
    [account.address, navigate],
  )

  const onDeleteClicked = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()

      onDeleteModalOpen()
    },
    [onDeleteModalOpen],
  )

  const onDeleteConfirmed = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    await removeAccount(account)
    onDeleteModalClose()
  }

  return (
    <>
      <Flex position={"relative"} direction={"column"} w="full">
        <AccountListItem
          aria-label={`Select ${accountName}`}
          onClick={clickNavigateSettings ? onOptionsClick : onClick}
          accountName={accountName}
          accountAddress={account.address}
          networkId={account.networkId}
          accountType={account.type}
          isShield={Boolean(account.guardian)}
          avatarOutlined={status.code === "CONNECTED"}
          deploying={status.code === "DEPLOYING"}
          upgrade={needsUpgrade}
          connectedHost={isConnected ? originatingHost : undefined}
          pr={14}
        >
          {clickNavigateSettings && (
            <AccountItemIconContainer>
              <ChevronRightIcon opacity={0.6} />
            </AccountItemIconContainer>
          )}
          {!clickNavigateSettings && (
            <AccountItemIconContainer>
              <Button
                as={Circle}
                aria-label={`${accountName} options`}
                colorScheme="transparent"
                width={8}
                height={8}
                size="auto"
                rounded="full"
                onClick={onOptionsClick}
                bg="black"
                _hover={{
                  bg: "neutrals.600",
                }}
                position="relative"
              >
                <MoreIcon />
              </Button>

              {account.type === "multisig" && isMenuOpen && (
                <Box
                  boxShadow="menu"
                  bg="black"
                  border="1px solid"
                  borderColor="neutrals.700"
                  position="absolute"
                  top={5}
                  right={3}
                  borderRadius="xl"
                  py={2}
                  w={40}
                >
                  <Button
                    as={Circle}
                    px={5}
                    py={2}
                    variant="ghost"
                    borderRadius={0}
                    w="full"
                    justifyContent="flex-start"
                    minH={0}
                    height="auto"
                    onClick={onDeleteClicked}
                  >
                    <P4 color="neutrals.200">Delete</P4>
                  </Button>
                </Box>
              )}
            </AccountItemIconContainer>
          )}
        </AccountListItem>
      </Flex>

      <MultisigDeleteModal
        onClose={onDeleteModalClose}
        isOpen={isDeleteModalOpen}
        onDelete={onDeleteConfirmed}
      />
    </>
  )
}
