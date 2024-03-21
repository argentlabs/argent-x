import { FC } from "react"
import styled from "styled-components"

import { CopyTooltip } from "./CopyTooltip"
import { ContentCopyIcon } from "./Icons/MuiIcons"
import { normalizeAddress, formatTruncatedAddress } from "@argent/x-shared"

export const AccountAddressWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const AccountAddressIconsWrapper = styled.span`
  display: flex;
  gap: 6px;
  align-items: center;
  border: rgba(255, 255, 255, 0.15) solid 1px;
  border-radius: 12px;
  padding: 5px;
  margin-left: 5px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

export const Address = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  line-height: 14px;
  max-width: 170px;
  text-overflow: ellipsis;
  overflow: hidden;
  border-radius: 12px;
  padding: 4px 10px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;

  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  & > svg {
    margin-left: 7px;
  }
`

interface ShortAddressBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  address: string
}

export const ShortAddressBadge: FC<ShortAddressBadgeProps> = ({
  address,
  ...htmlDiv
}) => {
  return (
    <AccountAddressWrapper {...htmlDiv}>
      <CopyTooltip copyValue={normalizeAddress(address)} message="Copied!">
        <Address>
          {formatTruncatedAddress(address)}
          <ContentCopyIcon style={{ fontSize: 12 }} />
        </Address>
      </CopyTooltip>
    </AccountAddressWrapper>
  )
}
