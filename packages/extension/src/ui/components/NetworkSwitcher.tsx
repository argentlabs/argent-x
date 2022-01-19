import { FC } from "react"
import styled, { css } from "styled-components"

import { getNetwork, localNetworkUrl, networks } from "../../shared/networks"
import { useGlobalState } from "../states/global"
import { WalletStatusCode } from "../utils/wallet"

const NetworkName = styled.span`
  text-align: right;
`

const Network = styled.div<{ selected?: boolean }>`
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
  background: #161616;
  border-radius: 0 0 15px 15px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

  & > ${Network} {
    border-top: 1px #525252 solid;
  }

  & > ${Network}:last-child {
    border-radius: 0 0 15px 15px;
  }
`

const NetworkSwitcherWrapper = styled.div<{
  disabled?: boolean
}>`
  position: relative;

  & > ${Network} {
    border-radius: 30px;
  }

  ${({ disabled }) =>
    !disabled &&
    css`
      &:hover ${NetworkList} {
        display: block;
      }

      &:hover > ${Network} {
        border-radius: 15px 15px 0 0;
      }

      &:hover ${NetworkName} {
        min-width: 110px;
      }
    `}
`

export const NetworkStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
`

export const NetworkStatusIndicator = styled.span<{
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

interface NetworkSwitcherProps {
  disabled?: boolean
  hidePort?: boolean
}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({
  disabled,
  hidePort,
}) => {
  const { networkId, localhostPort } = useGlobalState()
  const currentNetwork = getNetwork(networkId)
  const otherNetworks = networks.filter((network) => network !== currentNetwork)

  const formatName = (name: string) =>
    hidePort && name === "Localhost" ? `Localhost ${localhostPort}` : name

  return (
    <NetworkSwitcherWrapper disabled={disabled}>
      <Network selected>
        <NetworkName>{formatName(currentNetwork.name)}</NetworkName>
        <NetworkStatusIndicator status="CONNECTED" />
      </Network>
      <NetworkList>
        {otherNetworks.map(({ id, name }) => (
          <Network
            key={id}
            onClick={() => useGlobalState.setState({ networkId: id })}
          >
            <NetworkName>{formatName(name)}</NetworkName>
            <NetworkStatusIndicator status="CONNECTED" />
          </Network>
        ))}
      </NetworkList>
    </NetworkSwitcherWrapper>
  )
}
