import { Flex, Image } from "@chakra-ui/react"
import { FC } from "react"

import { Button } from "./Button"
import { H4, H5, P3 } from "./Typography"

interface ActivityRowProps {
  balance: string
  balanceCurrency: string
  title: string
  subtitle: string
  rounded?: string
  src: string
}

const ActivityRow: FC<ActivityRowProps> = ({
  balance,
  balanceCurrency,
  rounded,
  src,
  subtitle,
  title,
}) => {
  return (
    <Button rounded="lg" justifyContent={"flex-start"} gap="3" py="12" px="6">
      <Image
        alt="test"
        w="36px"
        h="36px"
        src={src}
        rounded={rounded || "full"}
      />
      <Flex flex={1} justifyContent="space-between">
        <Flex
          direction="column"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <H5>{title}</H5>
          <P3 color="neutrals.300">{subtitle}</P3>
        </Flex>
        <Flex
          direction="column"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <H4>{balance}</H4>
          <P3 color="neutrals.300">{balanceCurrency}</P3>
        </Flex>
      </Flex>
    </Button>
  )
}

export { ActivityRow }
