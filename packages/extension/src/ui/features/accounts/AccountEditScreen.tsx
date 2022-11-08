import {
  BarBackButton,
  BarCloseButton,
  BarIconButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Center, Image, Input } from "@chakra-ui/react"
import { partition, some } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { settingsStore } from "../../../shared/settings"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { routes, useQuery, useReturnTo } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { upgradeAccount } from "../../services/backgroundAccounts"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { P } from "../../theme/Typography"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { Account } from "./Account"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { getNetworkAccountImageUrl } from "./accounts.service"
import {
  isHiddenAccount,
  useAccount,
  useAccounts,
  useSelectedAccountStore,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { useAddAccount } from "./useAddAccount"

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
  const { accountNames } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: currentNetwork.id,
  })
  const copyAccountAddress = account ? normalizeAddress(account.address) : ""
  const accountName = account
    ? getAccountName(account, accountNames)
    : "Not found"
  const blockExplorerTitle = useBlockExplorerTitle()

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

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={accountName}
      >
        <Center p={4}>
          <Image
            borderRadius={"full"}
            width={20}
            height={20}
            src={getNetworkAccountImageUrl({
              accountName,
              accountAddress,
              networkId: currentNetwork.id,
              backgroundColor: account?.hidden ? "333332" : undefined,
            })}
          />
        </Center>
        <CellStack>
          <Input
            placeholder="Account name"
            value={accountName}
            onChange={onAccountNameChange}
          ></Input>
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
