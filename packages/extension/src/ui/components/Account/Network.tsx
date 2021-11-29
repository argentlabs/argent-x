import { FC } from "react"
import styled from "styled-components"

import { defaultNetworks } from "../../../shared/networks"
import { WalletStatusCode } from "../../utils/wallet"

const AccountNetwork = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: right;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;

  background-color: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;

  font-weight: ${({ selected }) => (selected ? 600 : 400)};
  font-size: 12px;
  line-height: 14.4px;

  color: ${({ selected }) => (selected ? "white" : "rgba(255, 255, 255, 0.7)")};
  &:hover {
    color: white;
  }

  cursor: ${({ selected }) => (selected ? "default" : "pointer")};

  > span {
    padding-right: 5px;
  }
`

const NetworkList = styled.div`
  display: none;
  position: absolute;
  width: 100%;
  z-index: 1;

  & > ${AccountNetwork} {
    border-top: 1px #525252 solid;
  }

  & > ${AccountNetwork}:last-child {
    border-radius: 0 0 15px 15px;
  }
`

const NetworkSwitcherWrapper = styled.div`
  position: relative;

  &:hover ${NetworkList} {
    display: block;
  }

  & > ${AccountNetwork} {
    border-radius: 30px;
  }

  &:hover > ${AccountNetwork} {
    border-radius: 15px 15px 0 0;
  }
`

export const AccountStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
`

export const AccountStatusIndicator = styled.span<{
  status?: WalletStatusCode
}>`
  height: 8px;
  width: 8px;
  border-radius: 8px;

  background-color: ${({ status = "CONNECTED" }) =>
    status === "CONNECTED"
      ? "#02BBA8"
      : status === "DEPLOYING"
      ? "#ffa85c"
      : "transparent"};
`

interface NetworkSwitcherProps {}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({}) => {
  const currentNetwork = defaultNetworks[0]
  const otherNetworks = defaultNetworks.filter(
    ({ id }) => id !== currentNetwork.id,
  )

  return (
    <NetworkSwitcherWrapper>
      <AccountNetwork selected>
        <span>{currentNetwork.name}</span>
        <AccountStatusIndicator status="CONNECTED" />
      </AccountNetwork>
      <NetworkList>
        {otherNetworks.map(({ id, name }) => (
          <AccountNetwork key={id}>
            <span>{name}</span>
            <AccountStatusIndicator status="CONNECTED" />
          </AccountNetwork>
        ))}
      </NetworkList>
    </NetworkSwitcherWrapper>
  )
}
