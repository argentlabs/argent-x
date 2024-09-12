import { B3, iconsDeprecated } from "@argent/x-ui"
import { Center, Flex, Text } from "@chakra-ui/react"
import { FC, PropsWithChildren } from "react"

import { DappActionHeader } from "./connectDapp/DappActionHeader"
import { DappDisplayAttributes } from "./connectDapp/useDappDisplayAttributes"
import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"

const { ChevronRightIcon } = iconsDeprecated

export interface SwitchNetworkScreenProps extends ConfirmScreenProps {
  fromNetworkTitle?: string
  toNetworkTitle?: string
  host: string
  dappDisplayAttributes?: DappDisplayAttributes
}

export const SwitchNetworkScreen: FC<SwitchNetworkScreenProps> = ({
  fromNetworkTitle = "From",
  toNetworkTitle = "To",
  host,
  dappDisplayAttributes,
  ...rest
}) => {
  return (
    <ConfirmScreen
      confirmButtonText="Switch network"
      rejectButtonText="Cancel"
      {...rest}
    >
      <DappActionHeader
        host={host}
        dappDisplayAttributes={dappDisplayAttributes}
        title={`${
          dappDisplayAttributes?.title ?? "Dapp"
        } is requesting to switch the network`}
        mb={3}
      />
      <Flex
        borderTop="1px solid"
        borderTopColor="neutrals.700"
        gap={4}
        w={"full"}
        alignItems={"center"}
        pt={4}
      >
        <NetworkPill>{fromNetworkTitle}</NetworkPill>
        <Text fontSize={"xl"}>
          <ChevronRightIcon />
        </Text>
        <NetworkPill>{toNetworkTitle}</NetworkPill>
      </Flex>
    </ConfirmScreen>
  )
}

function NetworkPill(props: PropsWithChildren) {
  return (
    <Center
      bg={"neutrals.800"}
      py={4}
      px={3}
      rounded={"full"}
      w={"full"}
      textAlign={"center"}
      overflow={"hidden"}
    >
      <B3
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        {...props}
      />
    </Center>
  )
}
