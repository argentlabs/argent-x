import AddIcon from "@mui/icons-material/Add"
import { FC, Suspense, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import { getNetwork } from "../../../shared/networks"
import { Account } from "../../Account"
import { useAccountStatus } from "../../hooks/useAccountStatus"
import { routes } from "../../routes"
import {
  getAccountName,
  useAccountMetadata,
} from "../../states/accountMetadata"
import { useAccountTransactions } from "../../states/accountTransactions"
import { useAppState } from "../../states/app"
import { useLocalhostPort } from "../../states/localhostPort"
import { makeClickable } from "../../utils/a11y"
import { connectAccount } from "../../utils/accounts"
import { sendTransaction } from "../../utils/transactions"
import { checkIfUpdateAvailable } from "../../utils/upgrade"
import { Spinner } from "../Spinner"
import { AddTokenIconButton, TokenTitle, TokenWrapper } from "../Token"
import { AccountSubHeader } from "./AccountSubheader"
import { PendingTransactions } from "./PendingTransactions"
import { TokenList } from "./TokenList"
import { UpdateBanner } from "./UpdateBanner"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

interface AccountAssetsProps {
  account: Account
}

export const AccountAssets: FC<AccountAssetsProps> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { localhostPort } = useLocalhostPort()
  const status = useAccountStatus(account)
  const { pendingTransactions } = useAccountTransactions(account.address)
  const { accountNames, setAccountName } = useAccountMetadata()

  const showPendingTransactions = pendingTransactions.length > 0
  const accountName = getAccountName(account, accountNames)
  const network = getNetwork(switcherNetworkId)

  const { data: showUpdateBanner = false } = useSWR(
    [account, network.accountImplementation],
    checkIfUpdateAvailable,
    { suspense: false },
  )

  const canShowEmptyAccountAlert = !showPendingTransactions && !showUpdateBanner

  useEffect(() => {
    connectAccount(account, switcherNetworkId, localhostPort)
  }, [account, switcherNetworkId, localhostPort])

  return (
    <Container>
      <AccountSubHeader
        networkId={switcherNetworkId}
        status={status}
        accountName={accountName}
        accountAddress={account.address}
        onChangeName={(name) =>
          setAccountName(account.networkId, account.address, name)
        }
      />
      {showUpdateBanner && !showPendingTransactions && (
        <UpdateBanner
          onClick={() => {
            if (network.accountImplementation) {
              sendTransaction({
                to: account.address,
                method: "upgrade",
                calldata: {
                  implementation: network.accountImplementation,
                },
              })
            }
          }}
        />
      )}
      <PendingTransactions accountAddress={account.address} />
      <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
        <TokenList
          showTitle={!canShowEmptyAccountAlert}
          accountAddress={account.address}
          canShowEmptyAccountAlert={canShowEmptyAccountAlert}
        />
        <TokenWrapper {...makeClickable(() => navigate(routes.newToken()))}>
          <AddTokenIconButton size={40}>
            <AddIcon />
          </AddTokenIconButton>
          <TokenTitle>Add token</TokenTitle>
        </TokenWrapper>
      </Suspense>
    </Container>
  )
}
