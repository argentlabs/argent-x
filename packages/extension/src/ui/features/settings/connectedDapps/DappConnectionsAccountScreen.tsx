import {
  BarBackButton,
  CellStack,
  Empty,
  H6,
  NavigationContainer,
  P4,
  iconsDeprecated,
} from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

import { Flex } from "@chakra-ui/react"
import { DappConnectionMenuItem } from "../ui/DappConnectionMenuItem"
import { PreAuthorization } from "../../../../shared/preAuthorization/schema"

const { LinkIcon } = iconsDeprecated

interface DappConnectionsAccountScreenProps {
  accountName?: string
  preAuthorizations: PreAuthorization[]
  onRemoveAll: ReactEventHandler
  onRemove: (preAuthorization: PreAuthorization) => void
}

export const DappConnectionsAccountScreen: FC<
  DappConnectionsAccountScreenProps
> = ({ accountName, preAuthorizations = [], onRemoveAll, onRemove }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={accountName ?? "Connected dapps"}
    >
      {preAuthorizations.length === 0 ? (
        <Empty icon={<LinkIcon />} title={"No connected dapps"} />
      ) : (
        <CellStack width={"full"}>
          <Flex w="full" alignItems={"center"}>
            <H6 color="text-secondary">Connected dapps</H6>
            <P4
              ml="auto"
              fontWeight="semibold"
              color="primary.500"
              cursor="pointer"
              transitionProperty={"common"}
              transitionDuration={"fast"}
              onClick={onRemoveAll}
              _hover={{ color: "primary.600" }}
            >
              Disconnect all
            </P4>
          </Flex>
          {preAuthorizations.map((preAuthorization) => (
            <DappConnectionMenuItem
              key={preAuthorization.host}
              host={preAuthorization.host}
              onRemoveClick={() => void onRemove(preAuthorization)}
            />
          ))}
        </CellStack>
      )}
    </NavigationContainer>
  )
}
