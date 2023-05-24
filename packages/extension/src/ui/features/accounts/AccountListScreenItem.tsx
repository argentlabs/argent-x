import { Button, icons } from "@argent/ui"
import { Circle, Flex } from "@chakra-ui/react"
import { FC, MouseEvent, ReactEventHandler, useCallback, useRef } from "react"

import { AccountListItem, AccountListItemProps } from "./AccountListItem"
import { AccountListScreenItemAccessory } from "./AccountListScreenItemAccessory"

const { MoreIcon, ChevronRightIcon } = icons

interface AccountListScreenItemProps extends AccountListItemProps {
  clickNavigateSettings?: boolean
  onClick: ReactEventHandler
  onAccessoryClick: ReactEventHandler
}

export const AccountListScreenItem: FC<AccountListScreenItemProps> = ({
  accountName,
  onClick,
  onAccessoryClick,
  accountAddress,
  networkId,
  accountType,
  isShield,
  avatarOutlined,
  deploying,
  upgrade,
  connectedHost,
  isRemovedFromMultisig,
  clickNavigateSettings,
}) => {
  /**
   * this control has a button-within-button
   * the inner button shifts screen position as the button animates on click
   * which means the click action may fire on the unintended component
   * we keep state of which button the click action was initiated
   * in order to honor user intent
   */
  const mouseDownOnAccessory = useRef(false)

  const onClickInternal = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (clickNavigateSettings || mouseDownOnAccessory.current) {
        onAccessoryClick(e)
      } else {
        onClick(e)
      }
    },
    [clickNavigateSettings, onAccessoryClick, onClick],
  )

  return (
    <>
      <Flex position={"relative"} direction={"column"} w="full">
        <AccountListItem
          aria-label={`Select ${accountName}`}
          onMouseDown={(e) => {
            e.stopPropagation()
            mouseDownOnAccessory.current = false
          }}
          onClick={onClickInternal}
          accountName={accountName}
          accountAddress={accountAddress}
          networkId={networkId}
          accountType={accountType}
          isShield={isShield}
          avatarOutlined={avatarOutlined}
          deploying={deploying}
          upgrade={upgrade}
          connectedHost={connectedHost}
          isRemovedFromMultisig={isRemovedFromMultisig}
          pr={14}
        >
          <AccountListScreenItemAccessory>
            {clickNavigateSettings ? (
              <ChevronRightIcon opacity={0.6} />
            ) : (
              <Button
                aria-label={`${accountName} options`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  mouseDownOnAccessory.current = true
                }}
                onClick={onClickInternal}
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
            )}
          </AccountListScreenItemAccessory>
        </AccountListItem>
      </Flex>
    </>
  )
}
