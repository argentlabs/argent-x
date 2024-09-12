import { H6, icons, logosDeprecated } from "@argent/x-ui"
import { SimpleGrid, Box, Flex, Button, ButtonProps } from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { MobileAsset } from "./MobileAsset"
import { DapplandIcon } from "../../settings/ui/DapplandIcon"

const { XLogo } = logosDeprecated
const { ExpandIcon } = icons

interface LinkCardProps extends ButtonProps {
  children: ReactNode
  href: string
  icon: ReactNode
}

const LinkCard: FC<LinkCardProps> = ({ children, href, icon, ...rest }) => (
  <Button
    as="a"
    href={href}
    target="_blank"
    height={12}
    padding="0"
    m="0"
    bg="surface-elevated"
    display={"flex"}
    rounded={"lg"}
    borderRadius={"lg"}
    {...rest}
  >
    <Flex
      justifyContent="center"
      alignItems="center"
      bg="white"
      borderLeftRadius={"lg"}
      width={14}
      height="100%"
    >
      {icon}
    </Flex>
    <Flex
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      py="5"
      mx="3"
    >
      {children}
    </Flex>
  </Button>
)

export const ArgentLinksRow: FC = () => {
  return (
    <SimpleGrid columns={2} gap={3} w={"full"}>
      <Flex
        padding="0"
        m="0"
        bg="surface-elevated"
        display={"flex"}
        rounded={"lg"}
        height={"100px"}
        borderRadius={"lg"}
      >
        <Box bg="accent-brand" pr="5" pt="3" borderLeftRadius={"lg"}>
          <MobileAsset height="100%" />
        </Box>
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          w="100%"
          py="2"
        >
          <H6 mb="3">Download the mobile app</H6>
          <Button
            colorScheme="primary"
            size="xs"
            as="a"
            href="https://argent.xyz"
            target="_blank"
          >
            Download
          </Button>
        </Flex>
      </Flex>
      <Flex flexDir="column" gap="1">
        <LinkCard
          data-testid="dappland-link"
          href="https://dappland.com"
          icon={<DapplandIcon height="38px" width="38px" />}
        >
          <H6>Explore starknet apps</H6>
          <ExpandIcon color="icon-secondary" />
        </LinkCard>
        <LinkCard
          data-testid="twitter-link"
          href="https://twitter.com/argenthq"
          icon={<XLogo color="black" height="20px" width="20px" />}
        >
          <H6>Follow us on X</H6>
          <ExpandIcon color="icon-secondary" />
        </LinkCard>
      </Flex>
    </SimpleGrid>
  )
}
