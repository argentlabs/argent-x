import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { AlertDialog } from "@argent/ui"
import { isEqual } from "lodash-es"
import { FC, useCallback, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { defaultCustomNetworks } from "../../../shared/network"
import { networkService } from "../../../shared/network/service"
import { IconButton } from "../../components/IconButton"
import { AddIcon, RefreshIcon } from "../../components/Icons/MuiIcons"
import { ResponsiveFixedBox } from "../../components/Responsive"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { P } from "../../theme/Typography"
import { useNetworks } from "../networks/hooks/useNetworks"
import { DappConnection } from "./DappConnection"
import {
  validateRemoveNetwork,
  validateRestoreDefaultNetworks,
} from "./validateRemoveNetwork"
import { Box } from "@chakra-ui/react"

const IconButtonCenter = styled(IconButton)`
  margin: 0 auto;
`

const Footer = styled(ResponsiveFixedBox)`
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
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const isDefaultCustomNetworks = useMemo(() => {
    return isEqual(allNetworks, [...allNetworks, ...defaultCustomNetworks])
  }, [allNetworks])

  const removeNetworkClick = useCallback(async (networkId: string) => {
    try {
      const shouldRemoveNetwork = await validateRemoveNetwork(networkId)
      if (shouldRemoveNetwork) {
        await networkService.removeById(networkId)
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        setAlertDialogIsOpen(true)
      } else {
        // unexpected, throw to error boundary
        throw error
      }
    }
  }, [])

  const restoreDefaultsClick = useCallback(async () => {
    try {
      const shouldRemoveNetwork = await validateRestoreDefaultNetworks()
      if (shouldRemoveNetwork) {
        await networkService.restoreDefaults()
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        setAlertDialogIsOpen(true)
      } else {
        // unexpected, throw to error boundary
        throw error
      }
    }
  }, [])

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  return (
    <>
      <NavigationContainer leftButton={<BarBackButton />} title={"Networks"}>
        <CellStack pb={2}>
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
                  navigate(routes.settingsEditCustomNetwork(network.id))
                }}
                hideRemove={network.readonly}
                onRemoveClick={() => {
                  removeNetworkClick(network.id)
                }}
              />
            ))
          )}
        </CellStack>

        <Box mb={!isDefaultCustomNetworks ? "56px" : "0"}>
          <Link to={routes.settingsAddCustomNetwork()}>
            <IconButtonCenter size={48} style={{ marginTop: "32px" }}>
              <AddIcon fontSize="large" />
            </IconButtonCenter>
          </Link>
        </Box>

        {!isDefaultCustomNetworks && (
          <Footer>
            <RestoreDefaultsButton onClick={restoreDefaultsClick}>
              <RestoreDefaultsButtonIcon>
                <RefreshIcon fontSize="inherit" />
              </RestoreDefaultsButtonIcon>
              <div>Restore default networks</div>
            </RestoreDefaultsButton>
          </Footer>
        )}
      </NavigationContainer>

      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={"Cannot remove"}
        message={errorMessage}
        onCancel={onCancel}
      />
    </>
  )
}
