import AddIcon from "@mui/icons-material/Add"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { hackatonNetworks } from "../../shared/hackatonNetworks"
import { BackButton } from "../components/BackButton"
import { DappConnection } from "../components/DappConnection"
import { Header } from "../components/Header"
import { IconButton } from "../components/IconButton"
import { Spinner } from "../components/Spinner"
import { H2, P } from "../components/Typography"
import { useNetworks } from "../hooks/useNetworks"
import { routes } from "../routes"
import { useAppState } from "../states/app"
import { useSelectedNetwork } from "../states/selectedNetwork"
import { makeClickable } from "../utils/a11y"
import { addNetworks, removeNetworks } from "../utils/messaging"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 24px 32px;
  ${H2} {
    margin: 0;
  }
`

const HackatonIconButton = styled(IconButton)`
  padding: 4px;
  position: fixed;
  top: 16px;
  right: 16px;
  background-color: #161616;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
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

export const SettingsNetworksScreen: FC = () => {
  const { allNetworks, mutate } = useNetworks()
  const navigate = useNavigate()
  const [, setSelectedCustomNetwork] = useSelectedNetwork()

  const handleAddCustomNetwork = () => {
    navigate(routes.settingsAddCustomNetwork())
  }

  const handleAddHackatonNetworks = async () => {
    useAppState.setState({ isLoading: true })
    await addNetworks(hackatonNetworks)
    mutate((prevNetworks) => [...(prevNetworks || []), ...hackatonNetworks])
    useAppState.setState({ isLoading: false })
  }

  // set true if current time is before the hackaton end time (27.04.2022 00:00 GMT+1)
  const isHackatonTime = new Date() < new Date("2022-04-27T00:00:00.000Z")

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      {isHackatonTime && (
        <HackatonIconButton
          size={92}
          {...makeClickable(handleAddHackatonNetworks)}
        >
          <img
            src="./assets/starkathon.png"
            style={{
              borderRadius: 200,
            }}
          />
        </HackatonIconButton>
      )}
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

        <IconButtonCenter
          size={48}
          style={{ marginTop: "32px" }}
          {...makeClickable(handleAddCustomNetwork)}
        >
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </Wrapper>
    </>
  )
}
