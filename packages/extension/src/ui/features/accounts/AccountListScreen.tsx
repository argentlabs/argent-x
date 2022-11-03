import {
  BarCloseButton,
  BarIconButton,
  NavigationBar,
  ScrollContainer,
  icons,
  useScroll,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { partition, some } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isDeprecated } from "../../../shared/wallet.service"
import { IconButton } from "../../components/IconButton"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { Spinner } from "../../components/Spinner"
import { useReturnTo } from "../../routes"
import { P } from "../../theme/Typography"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountListScreenItem } from "./AccountListScreenItem"
import {
  isHiddenAccount,
  useAccounts,
  useSelectedAccountStore,
} from "./accounts.state"
import { DeprecatedAccountsWarning } from "./DeprecatedAccountsWarning"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { useAddAccount } from "./useAddAccount"

const { AddIcon } = icons

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const IconButtonCenterDisabled = styled(IconButtonCenter)`
  pointer-events: none;
`

const Paragraph = styled(P)`
  text-align: center;
`

const ErrorText = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.red2};
`

const DimmingContainer = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.5;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

const Footer = styled(ResponsiveFixedBox)`
  bottom: 0;
  background-color: ${({ theme }) => theme.bg1};
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  flex-direction: column;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { selectedAccount } = useSelectedAccountStore()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const { addAccount, isDeploying, deployFailed } = useAddAccount()

  const [deprecatedAccounts, newAccounts] = partition(
    visibleAccounts,
    (account) => isDeprecated(account),
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const { scrollRef, scroll } = useScroll()

  const onClose = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  return (
    <>
      <NavigationBar
        scroll={scroll}
        leftButton={<BarCloseButton onClick={onClose} disabled={isDeploying} />}
        title={"My accounts"}
        rightButton={
          <BarIconButton
            aria-label="Create new wallet"
            onClick={addAccount}
            isLoading={isDeploying}
          >
            <AddIcon />
          </BarIconButton>
        }
      />
      <ScrollContainer ref={scrollRef}>
        <Flex p={4} gap={2} direction="column">
          {isBackupRequired && <RecoveryBanner noMargins />}
          {visibleAccounts.length === 0 && (
            <Paragraph>
              No {hasHiddenAccounts ? "visible" : ""} accounts on this network,
              click below to add one.
            </Paragraph>
          )}
          {newAccounts.map((account) => (
            <AccountListScreenItem
              key={account.address}
              account={account}
              selectedAccount={selectedAccount}
              canShowUpgrade
            />
          ))}
          {some(deprecatedAccounts) && (
            <>
              <DeprecatedAccountsWarning />
              {deprecatedAccounts.map((account) => (
                <AccountListScreenItem
                  key={account.address}
                  account={account}
                  selectedAccount={selectedAccount}
                  canShowUpgrade
                />
              ))}
            </>
          )}
          {isDeploying && <DimmingContainer />}
        </Flex>
        {hasHiddenAccounts && (
          <Footer>
            <HiddenAccountsBar />
          </Footer>
        )}
      </ScrollContainer>
    </>
  )
}
