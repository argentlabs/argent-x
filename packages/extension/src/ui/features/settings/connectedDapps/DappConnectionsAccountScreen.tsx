import {
  BarBackButton,
  CellStack,
  Empty,
  H5,
  icons,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import { Flex } from "@chakra-ui/react"
import { DappConnectionMenuItem } from "../ui/DappConnectionMenuItem"
import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"

const { LinkPrimaryIcon } = icons

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
      title={accountName ?? "Authorised dapps"}
    >
      {preAuthorizations.length === 0 ? (
        <Empty icon={<LinkPrimaryIcon />} title={"No authorised dapps"} />
      ) : (
        <CellStack width={"full"}>
          <Flex w="full" alignItems={"center"}>
            <H5 color="text-secondary">Connected dapps</H5>
            <P3
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
            </P3>
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
