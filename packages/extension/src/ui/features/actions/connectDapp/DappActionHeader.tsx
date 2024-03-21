import { H5, KnownDappButton, P4 } from "@argent/x-ui"
import { Center, CenterProps, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { DappIcon } from "./DappIcon"
import { DappDisplayAttributes } from "./useDappDisplayAttributes"

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
      <H5 mt={4}>{title}</H5>
      <Flex gap="1" align="flex-end">
        <P4 fontWeight="bold" color={"neutrals.300"}>
          {hostName}
        </P4>
        {dappDisplayAttributes?.verified && (
          <KnownDappButton dapplandUrl={dappDisplayAttributes.dapplandUrl} />
        )}
      </Flex>
    </Center>
  )
}
