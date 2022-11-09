import {
  BarBackButton,
  BarCloseButton,
  BarIconButton,
  Button,
  ButtonCell,
  CellStack,
  NavigationContainer,
  SpacerCell,
  icons,
} from "@argent/ui"
import { Center, Flex, Image } from "@chakra-ui/react"
import { partition, some } from "lodash-es"
import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { routes, useQuery, useReturnTo } from "../../routes"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../services/addresses"
import { upgradeAccount } from "../../services/backgroundAccounts"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { P } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import { AccountListScreenItem } from "../accounts/AccountListScreenItem"
import {
  defaultAccountName,
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { getNetworkAccountImageUrl } from "../accounts/accounts.service"
import {
  isHiddenAccount,
  useAccount,
  useAccounts,
  useSelectedAccountStore,
} from "../accounts/accounts.state"
import { DeprecatedAccountsWarning } from "../accounts/DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "../accounts/HiddenAccountsBar"
import { useAddAccount } from "../accounts/useAddAccount"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountEditName } from "./AccountEditName"

const {
  AddIcon,
  MoreIcon,
  ExpandIcon,
  HideIcon,
  PluginIcon,
  AlertIcon,
  EditIcon,
} = icons

export const AccountEditScreen: FC = () => {
  const currentNetwork = useCurrentNetwork()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { accountNames, setAccountName } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })
  const copyAccountAddress = account ? normalizeAddress(account.address) : ""
  const accountName = account
    ? getAccountName(account, accountNames)
    : "Not found"
  const blockExplorerTitle = useBlockExplorerTitle()

  const [liveEditingAccountName, setLiveEditingAccountName] =
    useState(accountName)

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  const experimentalPluginAccount = useKeyValueStorage(
    settingsStore,
    "experimentalPluginAccount",
  )

  const showDelete =
    account && (isDeprecated(account) || account.networkId === "localhost")

  const handleHideOrDeleteAccount = async (account: Account) => {
    if (showDelete) {
      navigate(routes.accountDeleteConfirm(account.address))
    } else {
      navigate(routes.accountHideConfirm(account.address))
    }
  }

  const canUpgradeToPluginAccount =
    experimentalPluginAccount &&
    account &&
    currentNetwork.accountClassHash?.argentPluginAccount &&
    account.type !== "argent-plugin"

  const onAccountNameChange = useCallback((e: any) => {
    console.log("onAccountNameChange", e)
  }, [])

  const onChangeName = useCallback((name: string) => {
    // account && setAccountName(account.networkId, account.address, name)
    setLiveEditingAccountName(name)
  }, [])

  const onSubmitChangeName = useCallback(() => {
    account &&
      setAccountName(account.networkId, account.address, liveEditingAccountName)
  }, [account, liveEditingAccountName, setAccountName])

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
              <Button
                size="3xs"
                color={"white50"}
                bg={"transparent"}
                _hover={{ bg: "neutrals.700", color: "text" }}
              >
                {formatTruncatedAddress(accountAddress)}
              </Button>
            </Center>
          </Flex>
          <SpacerCell />
          <ButtonCell
            onClick={() =>
              account &&
              openBlockExplorerAddress(currentNetwork, account.address)
            }
            rightIcon={<ExpandIcon />}
          >
            View on {blockExplorerTitle}
          </ButtonCell>
          <ButtonCell
            onClick={() => account && handleHideOrDeleteAccount(account)}
            icon={<HideIcon />}
          >
            {showDelete ? "Delete" : "Hide"} account
          </ButtonCell>
          {canUpgradeToPluginAccount && (
            <ButtonCell
              onClick={() => upgradeAccount(account, "argent-plugin")}
              icon={<PluginIcon />}
            >
              Use Plugins
            </ButtonCell>
          )}
          <ButtonCell
            color={"error.500"}
            onClick={() => navigate(routes.exportPrivateKey())}
            icon={<AlertIcon />}
          >
            Export private key
          </ButtonCell>
        </CellStack>
      </NavigationContainer>
    </>
  )
}
