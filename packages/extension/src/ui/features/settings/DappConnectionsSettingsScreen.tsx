import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { VStack } from "@chakra-ui/react"
import { uniq } from "lodash-es"
import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  removePreAuthorization,
  resetPreAuthorizations,
  usePreAuthorizations,
} from "../../../shared/preAuthorizations"
import { Button } from "../../components/Button"
import { P } from "../../theme/Typography"
import { DappConnection } from "./DappConnection"

export const DappConnectionsSettingsScreen: FC = () => {
  const navigate = useNavigate()

  const preAuthorizations = usePreAuthorizations()

  const preauthorizedHosts = useMemo<string[]>(() => {
    return uniq(
      preAuthorizations.map((preAuthorization) => preAuthorization.host),
    )
  }, [preAuthorizations])

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Dapp connections"}
    >
      <VStack gap="6">
        {preauthorizedHosts === null ? null : preauthorizedHosts.length ===
          0 ? (
          <P>You haven&apos;t connected to any dapp yet.</P>
        ) : (
          <CellStack gap="4">
            {preauthorizedHosts.map((host) => (
              <DappConnection
                key={host}
                host={host}
                onRemoveClick={async () => {
                  /** passing null as accountAddress will remove all accounts */
                  await removePreAuthorization(host)
                }}
              />
            ))}

            <P>Require all dapps to request a new connection to your wallet?</P>
            <Button
              onClick={() => {
                resetPreAuthorizations()
                navigate(-1)
              }}
            >
              Reset all dapp connections
            </Button>
          </CellStack>
        )}
      </VStack>
    </NavigationContainer>
  )
}
