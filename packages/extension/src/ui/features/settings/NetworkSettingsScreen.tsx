import { isEqual } from "lodash-es"
import { FC, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import {
  removeNetwork,
  restoreDefaultCustomNetworks,
} from "../../../shared/network"
import { defaultCustomNetworks } from "../../../shared/network/storage"
import { IconBar } from "../../components/IconBar"
import { IconButton } from "../../components/IconButton"
import { AddIcon, RefreshIcon } from "../../components/Icons/MuiIcons"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { H2, P } from "../../theme/Typography"
import { useCustomNetworks, useNetworks } from "../networks/useNetworks"
import { DappConnection } from "./DappConnection"
import { useSelectedNetwork } from "./selectedNetwork.state"

interface IWrapper {
  isDefaultCustomNetworks: boolean
}

const Wrapper = styled.div<IWrapper>`
  display: flex;
  flex-direction: column;
  padding: 0 32px
    ${({ isDefaultCustomNetworks }) =>
      isDefaultCustomNetworks ? "24px" : "56px"}
    32px;
  ${H2} {
    margin: 0;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: 0 auto;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0 8px;
  width: 100%;

  > * + * {
    margin-top: 8px;
  }

  > * {
    width: 100%;
  }
`

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg1};
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`

const RestoreDefaultsButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  color: ${({ theme }) => theme.text3};
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 200ms ease-in-out;
  &:hover {
    color: ${({ theme }) => theme.text2};
  }
`

const RestoreDefaultsButtonIcon = styled.div`
  font-size: 14px;
`

export const NetworkSettingsScreen: FC = () => {
  const allNetworks = useNetworks()
  const navigate = useNavigate()
  const [, setSelectedCustomNetwork] = useSelectedNetwork()
  const customNetworks = useCustomNetworks()

  const isDefaultCustomNetworks = useMemo(() => {
    return isEqual(customNetworks, defaultCustomNetworks)
  }, [customNetworks])

  return (
    <>
      <IconBar back />
      <Wrapper isDefaultCustomNetworks={isDefaultCustomNetworks}>
        <H2>Networks</H2>
        <List>
          {!allNetworks ? (
            <Spinner />
          ) : allNetworks.length === 0 ? (
            <P>No custom networks found</P>
          ) : (
            allNetworks.map((network) => (
              <DappConnection
                key={network.id}
                host={network.name}
                onClick={() => {
                  setSelectedCustomNetwork(network)
                  navigate(routes.settingsEditCustomNetwork())
                }}
                hideRemove={network.readonly}
                onRemoveClick={async () => {
                  await removeNetwork(network.id)
                }}
              />
            ))
          )}
        </List>

        <Link to={routes.settingsAddCustomNetwork()}>
          <IconButtonCenter size={48} style={{ marginTop: "32px" }}>
            <AddIcon fontSize="large" />
          </IconButtonCenter>
        </Link>

        {!isDefaultCustomNetworks && (
          <Footer>
            <RestoreDefaultsButton
              onClick={async () => await restoreDefaultCustomNetworks()}
            >
              <RestoreDefaultsButtonIcon>
                <RefreshIcon fontSize="inherit" />
              </RestoreDefaultsButtonIcon>
              <div>Restore default networks</div>
            </RestoreDefaultsButton>
          </Footer>
        )}
      </Wrapper>
    </>
  )
}
