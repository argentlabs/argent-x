import {
  BarBackButton,
  CellStack,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import React, { FC, useCallback, useState } from "react"
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
import { UpgradeBannerContainer } from "../../accountTokens/UpgradeBannerContainer"
import { useIsLedgerSigner } from "../../ledger/hooks/useIsLedgerSigner"
import { multisigView } from "../../multisig/multisig.state"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { useRouteWalletAccount } from "../../smartAccount/useRouteWalletAccount"
import { AccountEditButtonsContainer } from "./AccountEditButtons/AccountEditButtonsContainer"
import { AccountEditName } from "./AccountEditName"
import { useView } from "../../../views/implementation/react"

export const AccountSettingsScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const account = useRouteWalletAccount()
  const accountAddress = account?.address ?? ""
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const accountName = account ? account.name : "Not found"

  const isLedger = useIsLedgerSigner(account)
  const multisig = useView(multisigView(account))

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

    void accountService.setName(liveEditingAccountName, account)
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

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={liveEditingAccountName}
        data-testid={`account-settings-${liveEditingAccountName.replaceAll(/ /g, "")}`}
      >
        <Center p={4}>
          <AccountAvatar
            size={20}
            src={getNetworkAccountImageUrl({
              accountName: liveEditingAccountName,
              accountAddress,
              networkId: currentNetwork.id,
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
          <Flex direction={"column"}>
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
              borderBottomLeftRadius="lg"
              borderBottomRightRadius="lg"
              p={2}
            >
              <StarknetIdOrAddressCopyButton account={account} />
            </Center>
          </Flex>
          <SpacerCell />
          <UpgradeBannerContainer account={account} multisig={multisig} />
          <AccountEditButtonsContainer account={account} />
        </CellStack>
      </NavigationContainer>
    </>
  )
}
