import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { FC } from "react"
import styled from "styled-components"

import { getNetwork } from "../../../shared/networks"
import { formatAddress, truncateAddress } from "../../utils/addresses"
import { WalletStatus } from "../../utils/wallets"
import { CopyTooltip } from "../CopyTooltip"
import { EditableHeader } from "../EditableHeader"
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

const AccountName = styled(EditableHeader)`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;
`

interface AccountSubheaderProps {
  networkId: string
  status: WalletStatus
  accountNumber: number
  accountName?: string
  walletAddress: string
  onChangeName: (networkId: string, address: string, name: string) => void
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  networkId,
  status,
  walletAddress,
  onChangeName,
  accountName,
}) => (
  <>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          alignSelf: "center",
          width: 200,
        }}
      >
        <AccountName
          value={accountName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChangeName(networkId, walletAddress, e.target.value)
          }
        />
      </div>
      {status.code !== "CONNECTED" && status.code !== "DEFAULT" && (
        <AccountStatusText color={status.code === "ERROR" ? "red" : undefined}>
          {status.text}
        </AccountStatusText>
      )}
    </div>
    <AccountAddressWrapper>
      <AccountAddressLink
        href={`${getNetwork(networkId).explorerUrl}/contract/${walletAddress}`}
        target="_blank"
      >
        {truncateAddress(walletAddress)}
        <OpenInNewIcon style={{ fontSize: 10 }} />
      </AccountAddressLink>
      <CopyTooltip copyValue={formatAddress(walletAddress)} message="Copied!">
        <AccountAddressIconsWrapper>
          <ContentCopyIcon style={{ fontSize: 12 }} />
        </AccountAddressIconsWrapper>
      </CopyTooltip>
    </AccountAddressWrapper>
  </>
)
