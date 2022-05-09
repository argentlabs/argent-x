import { FC } from "react"
import styled from "styled-components"

import { CopyTooltip } from "../../components/CopyTooltip"
import { ContentCopyIcon, OpenInNewIcon } from "../../components/Icons/MuiIcons"
import { useNetwork } from "../../hooks/useNetworks"
import { AccountStatus } from "../../utils/accounts"
import { formatTruncatedAddress, normalizeAddress } from "../../utils/addresses"
import { getVoyagerContractLink } from "../../utils/voyager.service"
import { AccountName } from "./AccountName"
import {
  AccountAddressIconsWrapper,
  AccountAddressLink,
  AccountAddressWrapper,
} from "./Address"

const AccountStatusText = styled.p<{ color?: string }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
  margin-top: 6px;
  color: ${({ color }) => color};
`

interface AccountSubheaderProps {
  networkId: string
  status: AccountStatus
  accountName?: string
  accountAddress: string
  onChangeName: (name: string) => void
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  networkId,
  status,
  accountAddress,
  onChangeName,
  accountName,
}) => {
  const { network } = useNetwork(networkId)
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
      <AccountAddressWrapper style={{ margin: "16px 0 18px 0" }}>
        <AccountAddressLink
          href={getVoyagerContractLink(accountAddress, network)}
          target="_blank"
        >
          {formatTruncatedAddress(accountAddress)}
          <OpenInNewIcon style={{ fontSize: 10 }} />
        </AccountAddressLink>
        <CopyTooltip
          copyValue={normalizeAddress(accountAddress)}
          message="Copied!"
        >
          <AccountAddressIconsWrapper>
            <ContentCopyIcon style={{ fontSize: 12 }} />
          </AccountAddressIconsWrapper>
        </CopyTooltip>
      </AccountAddressWrapper>
    </>
  )
}
