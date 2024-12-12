import { H4, P3 } from "@argent/x-ui"
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
      <H4>{title}</H4>
      <Flex gap={1}>
        <P3 fontWeight={"semibold"} color="text-secondary">
          {subtitle}
        </P3>
        {dappHost && <KnownDappButtonWrapper dappHost={dappHost} />}
      </Flex>
    </Flex>
  )
}
