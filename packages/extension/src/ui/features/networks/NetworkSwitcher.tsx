import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled, { css } from "styled-components"

import { NetworkStatus, getNetwork } from "../../../shared/networks"
import { useAppState } from "../../app.state"
import {
  NetworkStatusIndicator,
  mapNetworkStatusToColor,
} from "../../components/StatusIndicator"
import { routes } from "../../routes"
import { recover } from "../recovery/recovery.service"
import { useNeedsToShowNetworkStatusWarning } from "./seenNetworkStatusWarning.state"
import { useNetworkStatuses, useNetworks } from "./useNetworks"

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

  color: ${({ theme, selected }) =>
    selected ? theme.text1 : "rgba(255, 255, 255, 0.7)"};
  &:hover {
    color: ${({ theme }) => theme.text1};
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
  background: ${({ theme }) => theme.bg1};
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

const valuesToShowNetwortWarning: Array<NetworkStatus> = ["degraded", "error"]

interface NetworkSwitcherProps {
  disabled?: boolean
}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ disabled }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { allNetworks } = useNetworks({ suspense: true })
  const currentNetwork = getNetwork(switcherNetworkId, allNetworks)
  const otherNetworks = allNetworks.filter(
    (network) => network !== currentNetwork,
  )
  const { networkStatuses } = useNetworkStatuses()
  const [needsToShowNetworkStatusWarning] = useNeedsToShowNetworkStatusWarning()

  const currentNetworkStatus = networkStatuses[currentNetwork.id]

  useEffect(() => {
    if (
      currentNetworkStatus &&
      valuesToShowNetwortWarning.includes(currentNetworkStatus) &&
      needsToShowNetworkStatusWarning
    ) {
      navigate(routes.networkWarning())
    }
    // just trigger on network status change
  }, [currentNetworkStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NetworkSwitcherWrapper disabled={disabled}>
      <Network selected role="button" aria-label="Selected network">
        <NetworkName>{currentNetwork.name}</NetworkName>
        <NetworkStatusIndicator
          color={mapNetworkStatusToColor(currentNetworkStatus)}
        />
      </Network>
      <NetworkList>
        {otherNetworks.map(({ id, name }) => (
          <Network
            key={id}
            onClick={async () =>
              navigate(await recover({ networkId: id, showAccountList: true }))
            }
          >
            <NetworkName>{name}</NetworkName>
            <NetworkStatusIndicator
              color={mapNetworkStatusToColor(networkStatuses[id])}
            />
          </Network>
        ))}
      </NetworkList>
    </NetworkSwitcherWrapper>
  )
}
