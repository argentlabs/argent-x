import {
  BarBackButton,
  BarCloseButton,
  BarIconButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { partition, some } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { useQuery, useReturnTo } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { P } from "../../theme/Typography"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountListScreenItem } from "./AccountListScreenItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import {
  isHiddenAccount,
  useAccount,
  useAccounts,
  useSelectedAccountStore,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { useAddAccount } from "./useAddAccount"

const { AddIcon } = icons

export const AccountEditScreen: FC = () => {
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { switcherNetworkId } = useAppState()
  const { accountNames } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: switcherNetworkId,
  })
  const copyAccountAddress = account ? normalizeAddress(account.address) : ""
  const accountName = account
    ? getAccountName(account, accountNames)
    : "Not found"
  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onClose} />}
        title={accountName}
      >
        <span>Content in here</span>
        <CellStack>
          <ButtonCell leftIcon={<AddIcon />} rightIcon={<AddIcon />}>
            Extended view
          </ButtonCell>
          <ButtonCell rightIcon={<AddIcon />}>Extended view</ButtonCell>
          <ButtonCell leftIcon={<AddIcon />}>Extended view</ButtonCell>
        </CellStack>
      </NavigationContainer>
    </>
  )
}
