import { FC, useRef } from "react"
import styled from "styled-components"

import { CopyTooltip } from "../../components/CopyTooltip"
import { ContentCopyIcon } from "../../components/Icons/MuiIcons"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../services/addresses"
import { AccountStatus } from "../accounts/accounts.service"
import { AccountMenu } from "./AccountMenu"
import { AccountName } from "./AccountName"
import { AccountAddressWrapper, Address } from "./Address"

const AccountStatusText = styled.p<{ color?: string }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
  margin-top: 6px;
  color: ${({ color }) => color};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  width: 250px;
`

interface AccountSubheaderProps {
  status: AccountStatus
  accountName?: string
  accountAddress: string
  onChangeName: (name: string) => void
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  status,
  accountAddress,
  onChangeName,
  accountName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

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
          <AccountStatusText
            color={status.code === "ERROR" ? "red" : undefined}
          >
            {status.text}
          </AccountStatusText>
        )}
      </div>
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
