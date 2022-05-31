import { FC } from "react"
import styled from "styled-components"

import { CopyTooltip } from "../../components/CopyTooltip"
import { ContentCopyIcon } from "../../components/Icons/MuiIcons"
import {
  formatTruncatedAddress,
  normalizeAddress,
} from "../../services/addresses"
import { AccountStatus } from "../accounts/accounts.service"
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
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ alignSelf: "center", width: 250 }}>
          <AccountName
            value={accountName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChangeName(e.target.value)
            }
          />
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
