import { H5, P4 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { KnownDappButtonWrapper } from "../../connectDapp/KnownDappButtonWrapper"

export const TransactionTitle = ({
  title,
  subtitle,
  dappHost,
}: {
  title: string
  subtitle?: string
  dappHost?: string
}) => {
  return (
    <Flex direction="column">
      <H5>{title}</H5>
      <Flex>
        <P4 fontWeight={"semibold"} color="text-secondary">
          {subtitle}
        </P4>
        {dappHost && <KnownDappButtonWrapper dappHost={dappHost} />}
      </Flex>
    </Flex>
  )
}
