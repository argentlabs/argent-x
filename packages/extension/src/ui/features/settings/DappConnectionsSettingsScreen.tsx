import {
  BarBackButton,
  CellStack,
  Empty,
  HeaderCell,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { uniq } from "lodash-es"
import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  removePreAuthorization,
  resetPreAuthorizations,
  usePreAuthorizations,
} from "../../../shared/preAuthorizations"
import { Button } from "../../components/Button"
import { DappConnection } from "./DappConnection"

const { NetworkIcon } = icons

export const DappConnectionsSettingsScreen: FC = () => {
  const preAuthorizations = usePreAuthorizations()

  const preauthorizedHosts = useMemo(() => {
    return uniq(
      preAuthorizations.map((preAuthorization) => preAuthorization.host),
    )
  }, [preAuthorizations])

  return <DappConnectionsSettings preauthorizedHosts={preauthorizedHosts} />
}

interface DappConnectionsSettingsProps {
  preauthorizedHosts: string[]
}

export const DappConnectionsSettings: FC<DappConnectionsSettingsProps> = ({
  preauthorizedHosts = [],
}) => {
  const navigate = useNavigate()
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Dapp connections"}
    >
      {preauthorizedHosts.length === 0 ? (
        <Empty
          icon={<NetworkIcon />}
          title={"You haven’t connected to any dapp yet."}
        />
      ) : (
        <CellStack width={"full"}>
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

          <HeaderCell>
            Require all dapps to request a new connection to your wallet?
          </HeaderCell>
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
    </NavigationContainer>
  )
}
