import {
  BarBackButton,
  CellStack,
  NavigationContainer,
  SpacerCell,
} from "@argent/ui"
import { Center, Flex, Image } from "@chakra-ui/react"
import React, { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { accountService } from "../../../../shared/account/service"
import { useReturnTo } from "../../../routes"
import { getNetworkAccountImageUrl } from "../../accounts/accounts.service"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { useRouteAccount } from "../../shield/useRouteAccount"
import { AccountEditButtons } from "./AccountEditButtons"
import { AccountEditButtonsMultisig } from "./AccountEditButtonsMultisig"
import { AccountEditName } from "./AccountEditName"
import { StarknetIdOrAddressCopyButton } from "../../../components/StarknetIdOrAddressCopyButton"

export const AccountSettingsScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const account = useRouteAccount()
  const accountAddress = account?.address ?? ""
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const accountName = account ? account.name : "Not found"

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
  }, [account, liveEditingAccountName])

  const onCancelChangeName = useCallback(() => {
    setLiveEditingAccountName(accountName)
  }, [accountName])

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={liveEditingAccountName}
      >
        <Center p={4}>
          <Image
            borderRadius={"full"}
            width={20}
            height={20}
            src={getNetworkAccountImageUrl({
              accountName: liveEditingAccountName,
              accountAddress,
              networkId: currentNetwork.id,
              backgroundColor: account?.hidden ? "333332" : undefined,
            })}
          />
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
          {account?.type === "multisig" && account ? (
            <AccountEditButtonsMultisig account={account} />
          ) : (
            <AccountEditButtons />
          )}
        </CellStack>
      </NavigationContainer>
    </>
  )
}
