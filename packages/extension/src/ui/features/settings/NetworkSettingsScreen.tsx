import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { IconButton } from "../../components/IconButton"
import { AddIcon } from "../../components/Icons/MuiIcons"
import { Spinner } from "../../components/Spinner"
import { H2, P } from "../../components/Typography"
import { routes } from "../../routes"
import { removeNetworks } from "../../services/backgroundNetworks"
import { useNetworks } from "../networks/useNetworks"
import { DappConnection } from "./DappConnection"
import { useSelectedNetwork } from "./selectedNetwork.state"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 24px 32px;
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

export const NetworkSettingsScreen: FC = () => {
  const { allNetworks, mutate } = useNetworks()
  const navigate = useNavigate()
  const [, setSelectedCustomNetwork] = useSelectedNetwork()

  return (
    <>
      <IconBar back />
      <Wrapper>
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
                  // navigate(routes.settingsRemoveCustomNetwork()) // intended behavior in the future, so we can get a confirmation
                  await removeNetworks([network.id])

                  // optimistic update
                  await mutate((prevData) =>
                    prevData?.filter((n) => n.id !== network.id),
                  )
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
      </Wrapper>
    </>
  )
}
