import { FC } from "react"
import styled from "styled-components"

import Copy from "../../../assets/copy.svg"
import Open from "../../../assets/open.svg"
import { getNetwork } from "../../../shared/networks"
import { truncateAddress } from "../../utils/addresses"
import { WalletStatus, formatAddress, getAccountName } from "../../utils/wallet"
import { CopyTooltip } from "../CopyTooltip"
import { H1 } from "../Typography"
import {
  AccountAddressIconsWrapper,
  AccountAddressLink,
  AccountAddressWrapper,
} from "./Address"

const AccountStatusText = styled.p`
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
  margin-top: 6px;
`

const AccountName = styled(H1)`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;
`

interface AccountSubheaderProps {
  networkId: string
  status: WalletStatus
  accountNumber: number
  walletAddress: string
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
  networkId,
  status,
  accountNumber,
  walletAddress,
}) => (
  <>
    <div>
      <AccountName>{getAccountName(accountNumber)}</AccountName>
      {status.code !== "CONNECTED" && status.code !== "DEFAULT" && (
        <AccountStatusText>{status.text}</AccountStatusText>
      )}
    </div>
    <AccountAddressWrapper>
      <AccountAddressLink
        href={`${getNetwork(networkId).explorerUrl}/contract/${walletAddress}`}
        target="_blank"
      >
        {truncateAddress(walletAddress)}
        <Open />
      </AccountAddressLink>
      <CopyTooltip copyValue={formatAddress(walletAddress)} message="Copied!">
        <AccountAddressIconsWrapper>
          <Copy />
        </AccountAddressIconsWrapper>
      </CopyTooltip>
    </AccountAddressWrapper>
  </>
)
