import { Button, icons } from "@argent/ui"
import { Circle, Flex } from "@chakra-ui/react"
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

const { MoreIcon, ChevronRightIcon } = icons

export interface IAccountListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
}

export const AccountItemIconContainer: FC<{ children: ReactNode }> = ({
  children,
}) => (
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

  const isConnected = useIsPreauthorized(originatingHost || "", account)

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
      if (clickNavigateSettings || mouseDownSettings.current) {
        navigate(routes.editAccount(account.address))
      } else {
        await selectAccount(account)
        navigate(returnTo || routes.accountTokens())
      }
    },
    [account, clickNavigateSettings, navigate, returnTo, mouseDownSettings],
  )

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
            </AccountItemIconContainer>
          )}
        </AccountListItem>
      </Flex>
    </>
  )
}
