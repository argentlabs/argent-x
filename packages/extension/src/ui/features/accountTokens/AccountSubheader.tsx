import { FC, useRef } from "react"
import styled from "styled-components"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  ActionContainer,
  ActionsWrapper,
} from "../../components/ErrorBoundaryFallbackWithCopyError"
import { ContentCopyIcon, RefreshIcon } from "../../components/Icons/MuiIcons"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../services/addresses"
import { AccountStatus } from "../accounts/accounts.service"
import { AccountMenu } from "./AccountMenu"
import { AccountName } from "./AccountName"
import { AccountAddressWrapper, Address } from "./Address"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

const AccountStatusText = styled.p<{ error?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
  margin-bottom: 6px;
  color: ${({ error, theme }) => (error ? theme.red2 : "inherit")};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  width: 250px;
`

const AccountBalance = styled.div`
  font-weight: 600;
  font-size: 17px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
`

const StyledActionsWrapper = styled(ActionsWrapper)`
  margin: 8px 0;
`

interface AccountSubheaderProps {
  status: AccountStatus
  account: BaseWalletAccount
  accountName?: string
  onChangeName: (name: string) => void
  onRedeploy: () => void
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  status,
  account,
  onChangeName,
  accountName,
  onRedeploy,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { tokenDetails } = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  const accountAddress = account.address

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            alignSelf: "center",
            width: 250,
          }}
        >
          <Header>
            <AccountName
              value={accountName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChangeName(e.target.value)
              }
              inputRef={inputRef}
            />

            <AccountMenu onAccountNameEdit={() => inputRef.current?.focus()} />
          </Header>
        </div>
        {status.code !== "CONNECTED" && status.code !== "DEFAULT" && (
          <>
            <AccountStatusText error={status.code === "ERROR"}>
              {status.text}
            </AccountStatusText>
            {status.code === "ERROR" && (
              <StyledActionsWrapper>
                <ActionContainer onClick={onRedeploy}>
                  <RefreshIcon />
                  <span>Redeploy</span>
                </ActionContainer>
              </StyledActionsWrapper>
            )}
          </>
        )}
      </div>
      {sumCurrencyValue !== undefined && (
        <AccountBalance>
          {prettifyCurrencyValue(sumCurrencyValue)}
        </AccountBalance>
      )}
      <AccountAddressWrapper style={{ marginBottom: 18 }}>
        <CopyTooltip
          copyValue={normalizeAddress(accountAddress)}
          message="Copied!"
        >
          <Address>
            {formatTruncatedAddress(accountAddress)}
            <ContentCopyIcon style={{ fontSize: 12 }} />
          </Address>
        </CopyTooltip>
      </AccountAddressWrapper>
    </>
  )
}
