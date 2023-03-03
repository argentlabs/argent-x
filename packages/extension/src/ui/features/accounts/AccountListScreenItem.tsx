import { Button, P4, icons } from "@argent/ui"
import { Box, Circle, Flex, useDisclosure } from "@chakra-ui/react"
import { FC, MouseEvent, ReactNode, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"

import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { routes } from "../../routes"
import { selectAccount } from "../../services/backgroundAccounts"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useRemoveAccountCallback } from "./accounts.state"
import { MultisigDeleteModal } from "./multisig/MultisigDeleteModal"

const { MoreIcon, ChevronRightIcon } = icons

interface IAccountListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
}

const IconContainer: FC<{ children: ReactNode }> = ({ children }) => (
  <Flex
    position={"absolute"}
    right={4}
    top={"50%"}
    transform={"translateY(-50%)"}
  >
    {children}
  </Flex>
)

export const AccountListScreenItem: FC<IAccountListScreenItem> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
}) => {
  const navigate = useNavigate()
  const status = useAccountStatus(account, selectedAccount)
  const originatingHost = useOriginatingHost()

  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure()

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  const removeAccount = useRemoveAccountCallback()

  const isConnected = useIsPreauthorized(originatingHost || "", account)

  const hasJoinedMultiSig = false // TODO: useMultiSigStatus(account)

  // this is unnecessary for now, as we can easily source the upgrade status from the the list item (props)
  // may be useful in the future if dont partition the list by upgrade status anymore
  //
  // const { data: needsUpgrade = false } = useSWR(
  //   [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
  //   () => checkIfUpgradeAvailable(account, accountClassHash),
  //   { suspense: false, ...withPolling(60 * 1000) },
  // )

  /**
   * this control has a button-within-button
   * the inner button shifts screen position as the button animates on click
   * which means the click action may fire on the unintended component
   * we keep state of which button the click action was initiated
   * in order to honor user intent
   */

  const mouseDownSettings = useRef(false)

  const onClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()

      if (clickNavigateSettings || mouseDownSettings.current) {
        account.type === "multisig"
          ? onMenuOpen()
          : navigate(routes.editAccount(account.address))
      } else {
        await selectAccount(account)
        navigate(returnTo || routes.accountTokens())
      }
    },
    [clickNavigateSettings, account, onMenuOpen, navigate, returnTo],
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
      <Flex position={"relative"} direction={"column"}>
        <AccountListItem
          aria-label={`Select ${accountName}`}
          onMouseDown={(e) => {
            e.stopPropagation()
            mouseDownSettings.current = false
          }}
          onClick={onClick}
          accountName={accountName}
          accountAddress={account.address}
          networkId={account.networkId}
          accountType={account.type}
          isShield={Boolean(account.guardian)}
          avatarOutlined={status.code === "CONNECTED"}
          deploying={status.code === "DEPLOYING"}
          upgrade={needsUpgrade}
          connectedHost={isConnected ? originatingHost : undefined}
          multisigStatus={"pending"} // TODO: hasJoinedMultiSig ? "joined" : "pending"
          pr={14}
        >
          {clickNavigateSettings && (
            <IconContainer>
              <ChevronRightIcon opacity={0.6} />
            </IconContainer>
          )}
          {!clickNavigateSettings && (
            <IconContainer>
              <Button
                aria-label={`${accountName} options`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  mouseDownSettings.current = true
                }}
                onClick={onClick}
                as={Circle}
                colorScheme="transparent"
                width={8}
                height={8}
                size="auto"
                rounded="full"
                bg="black"
                _hover={{
                  bg: "neutrals.600",
                }}
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
            </IconContainer>
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
