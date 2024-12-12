import { Button, Empty, icons, L2Bold, logosDeprecated, P2 } from "@argent/x-ui"
import type { FlexProps } from "@chakra-ui/react"
import { Box, Flex, Text } from "@chakra-ui/react"
import type { FC, ReactNode } from "react"

const { NftIcon } = icons
const { UnframedLogo, ElementLogo } = logosDeprecated

const ButtonLink: FC<{ href: string; icon: ReactNode; title: string }> = ({
  icon,
  href,
  title,
}) => (
  <Box>
    <Button
      display="flex"
      h={14}
      w={23}
      as={"a"}
      mb={0.5}
      href={href}
      title={title}
      target="_blank"
    >
      <Text fontSize="3xl">{icon}</Text>
    </Button>
    <L2Bold>{title}</L2Bold>
  </Box>
)

const EmptyCollections: FC<FlexProps> = (props) => (
  <Flex
    direction="column"
    flex={1}
    textAlign="center"
    justifyContent="center"
    m={0}
    {...props}
  >
    <Empty icon={<NftIcon />} title={`No NFTs`} />
    <Flex direction="column" flex={1} bg="black" p="-4" alignItems="center">
      <P2 color="neutrals.400" mt="12">
        Discover NFTs on Starknet
      </P2>
      <Flex gap="2" mt={6}>
        <ButtonLink
          title="Unframed"
          icon={<UnframedLogo />}
          href="https://unframed.co/"
        />
        <ButtonLink
          title="Element"
          icon={<ElementLogo />}
          href="https://element.market/starknet"
        />
      </Flex>
    </Flex>
  </Flex>
)

export { EmptyCollections }
