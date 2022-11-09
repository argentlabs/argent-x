import { FC, useRef } from "react"
import styled from "styled-components"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { ActionContainer } from "../../components/ErrorBoundaryFallbackWithCopyError"
import { RefreshIcon } from "../../components/Icons/MuiIcons"
import { ShortAddressBadge } from "../../components/ShortAddressBadge"
import { AccountStatus } from "../accounts/accounts.service"
import { AccountName } from "./AccountName"
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

const StyledActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
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
      <ShortAddressBadge
        style={{ marginBottom: 18 }}
        address={accountAddress}
      />
    </>
  )
}
