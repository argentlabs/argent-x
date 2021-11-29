import { FC } from "react"
import styled from "styled-components"

import Copy from "../../../assets/copy.svg"
import Open from "../../../assets/open.svg"
import { truncateAddress } from "../../utils/addresses"
import { WalletStatus, getAccountName } from "../../utils/wallet"
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
  status: WalletStatus
  accountNumber: number
  walletAddress: string
}

export const AccountSubHeader: FC<AccountSubheaderProps> = ({
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
        href={`https://voyager.online/contract/${walletAddress}`}
        target="_blank"
      >
        starknet: {truncateAddress(walletAddress)}
        <Open style={{ marginLeft: 7 }} />
      </AccountAddressLink>
      <CopyTooltip copyValue={walletAddress} message="Copied!">
        <AccountAddressIconsWrapper>
          <Copy />
        </AccountAddressIconsWrapper>
      </CopyTooltip>
    </AccountAddressWrapper>
  </>
)
