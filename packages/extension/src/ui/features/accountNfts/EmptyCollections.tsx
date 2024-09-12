import {
  Button,
  H5,
  L2,
  P3,
  iconsDeprecated,
  logosDeprecated,
} from "@argent/x-ui"
import { Box, Flex, Text } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { NftIcon } = iconsDeprecated
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
    <L2>{title}</L2>
  </Box>
)

const EmptyCollections: FC<{ networkId: string }> = () => (
  <Flex
    direction="column"
    flex={1}
    textAlign="center"
    justifyContent="center"
    m={0}
  >
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <Flex
        bg="black"
        w="80px"
        h="80px"
        mb="4"
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
      >
        <Text fontSize="4xl">
          <NftIcon />
        </Text>
      </Flex>
      <H5 color="neutrals.400">No NFTs</H5>
    </Flex>
    <Flex direction="column" flex={1} bg="black" p="-4" alignItems="center">
      <P3 color="neutrals.400" mt="12">
        Discover NFTs on Starknet
      </P3>
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
