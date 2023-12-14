import { Button, H5, L2, P3, icons, logos } from "@argent/ui"
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

const { NftIcon } = icons
const { BriqLogo, UnframedLogo, FlexLogo } = logos

const ButtonLink: FC<{ href: string; icon: ReactNode; title: string }> = ({
  icon,
  href,
  title,
}) => (
  <Box>
    <Button
      h="56px"
      mb="2"
      as={"a"}
      rounded="3xl"
      href={href}
      title={title}
      target="_blank"
    >
      <Text fontSize="3xl">{icon}</Text>
    </Button>
    <L2>{title}</L2>
  </Box>
)

const EmptyCollections: FC<{ networkId: string }> = ({ networkId }) => (
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
    <Flex direction="column" flex={1} bg="black" p="-4">
      <P3 color="neutrals.400" mb="3" mt="12">
        Discover NFTs on StarkNet
      </P3>

      <SimpleGrid columns={3} gap="2" mx="8">
        <ButtonLink
          title="Unframed"
          icon={<UnframedLogo />}
          href="https://unframed.co/"
        />
        <ButtonLink
          title="Flex"
          icon={<FlexLogo />}
          href="https://flexing.gg/"
        />
        <ButtonLink
          title="Briq"
          icon={<BriqLogo />}
          href="https://briq.construction/"
        />
      </SimpleGrid>
    </Flex>
  </Flex>
)

export { EmptyCollections }
