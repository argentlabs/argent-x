import {
  BarBackButton,
  CellStack,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  accountService,
  accountSharedService,
} from "../../../../shared/account/service"
import { StarknetIdOrAddressCopyButton } from "../../../components/StarknetIdOrAddressCopyButton"
import { useReturnTo } from "../../../hooks/useRoute"
import { AccountAvatar } from "../../accounts/AccountAvatar"
import { AccountListItemLedgerBadge } from "../../accounts/AccountListItemLedgerBadge"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import {
  UpgradeBannerContainer,
  useShowUpgradeBanner,
} from "../../banners/UpgradeBannerContainer"
import { useIsLedgerSigner } from "../../ledger/hooks/useIsLedgerSigner"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import { AccountEditButtonsContainer } from "./AccountEditButtons/AccountEditButtonsContainer"
import { AccountEditName } from "./AccountEditName"

export const AccountSettingsScreen: FC = () => {
  const account = useRouteWalletAccount()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const accountName = account ? account.name : "Not found"
  const showUpgradeBanner = useShowUpgradeBanner(account)

  const isLedger = useIsLedgerSigner(account?.id)

  const [liveEditingAccountName, setLiveEditingAccountName] =
    useState(accountName)

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  const onChangeName = useCallback((name: string) => {
    setLiveEditingAccountName(name)
  }, [])

  const onSubmitChangeName = useCallback(() => {
    if (!account) {
      return
    }

    void accountService.setName(liveEditingAccountName, account.id)
    if (account.type === "smart") {
      void accountSharedService.sendAccountNameToBackend({
        address: account.address,
        name: liveEditingAccountName,
      })
    }
  }, [account, liveEditingAccountName])

  const onCancelChangeName = useCallback(() => {
    setLiveEditingAccountName(accountName)
  }, [accountName])

  if (!account) {
    return <></>
  }

  const testId = `account-settings-${liveEditingAccountName?.replaceAll(/ /g, "") ?? "unknown"}`

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={liveEditingAccountName}
        data-testid={testId}
      >
        <Center p={4}>
          <AccountAvatar
            size={20}
            src={getNetworkAccountImageUrl({
              accountName: liveEditingAccountName,
              accountId: account.id,
              backgroundColor: account?.hidden ? "333332" : undefined,
            })}
          >
            {isLedger && (
              <AccountListItemLedgerBadge
                fontSize="sm"
                size={6}
                p="4px"
                right={0.5}
                bottom={0.5}
                bg="surface-default"
              />
            )}
          </AccountAvatar>
        </Center>
        <CellStack>
          <Flex direction={"column"} boxShadow={"menu"}>
            <AccountEditName
              value={liveEditingAccountName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChangeName(e.target.value)
              }
              onSubmit={onSubmitChangeName}
              onCancel={onCancelChangeName}
              borderBottomLeftRadius={0}
              borderBottomRightRadius={0}
            />
            <Center
              border={"1px solid"}
              borderColor={"border"}
              borderTop={"none"}
              borderBottomRadius="lg"
              bg="surface-elevated"
              p={2}
            >
              <StarknetIdOrAddressCopyButton account={account} />
            </Center>
          </Flex>
          <SpacerCell />
          {showUpgradeBanner && <UpgradeBannerContainer account={account} />}
          <AccountEditButtonsContainer account={account} />
        </CellStack>
      </NavigationContainer>
    </>
  )
}
