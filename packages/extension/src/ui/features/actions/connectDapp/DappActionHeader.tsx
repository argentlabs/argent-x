import { H4, KnownDappButton, P3 } from "@argent/x-ui"
import type { CenterProps } from "@chakra-ui/react"
import { Center, Flex } from "@chakra-ui/react"
import type { FC } from "react"

import { DappIcon } from "./DappIcon"
import type { DappDisplayAttributes } from "../../../services/knownDapps/types"

export interface DappActionHeaderProps extends CenterProps {
  host: string
  title: string
  dappDisplayAttributes?: DappDisplayAttributes
}

export const DappActionHeader: FC<DappActionHeaderProps> = ({
  host,
  dappDisplayAttributes,
  title,
  ...rest
}) => {
  const hostName = new URL(host).hostname

  return (
    <Center flexDirection={"column"} textAlign={"center"} gap={1} {...rest}>
      <DappIcon dappDisplayAttributes={dappDisplayAttributes} />
      <H4 mt={4}>{title}</H4>
      <Flex gap="1" align="flex-end">
        <P3 fontWeight="bold" color={"neutrals.300"}>
          {hostName}
        </P3>
        {dappDisplayAttributes?.verified && (
          <KnownDappButton dapplandUrl={dappDisplayAttributes.dapplandUrl} />
        )}
      </Flex>
    </Center>
  )
}
