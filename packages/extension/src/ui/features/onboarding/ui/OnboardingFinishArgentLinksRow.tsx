import { ExpandIcon } from "@argent/x-ui/icons"
import { L1Bold } from "@argent/x-ui"
import type { ButtonProps, GridProps } from "@chakra-ui/react"
import { Flex, Button, Grid, GridItem, Image, Center } from "@chakra-ui/react"
import type { FC } from "react"

interface LinkButtonProps extends ButtonProps {
  href: string
  label?: string
  imageSrc?: string
  imageWidth?: string | number
}

const LinkButton: FC<LinkButtonProps> = ({
  children,
  href,
  label,
  imageSrc,
  imageWidth = 12,
  ...rest
}) => (
  <Button
    as="a"
    href={href}
    target="_blank"
    overflow="hidden"
    size="auto"
    display="flex"
    alignItems="center"
    rounded="lg"
    height="full"
    width="full"
    {...rest}
  >
    <Image
      display="flex"
      flexShrink={0}
      w={imageWidth}
      h="full"
      src={imageSrc}
      objectFit="cover"
    />
    {children ? (
      <>{children}</>
    ) : (
      <Flex flex={1} justifyContent="space-between" p={4} gap={2}>
        <L1Bold as="p">{label}</L1Bold>
        <ExpandIcon color="icon-secondary" fontSize="2xs" />
      </Flex>
    )}
  </Button>
)

export const OnboardingFinishArgentLinksRow: FC<GridProps> = (props) => {
  return (
    <Grid
      templateRows={{ sm: "repeat(2, 1fr)" }}
      templateColumns={{ sm: "repeat(2, 1fr)" }}
      columnGap={3}
      rowGap={2}
      {...props}
    >
      <GridItem rowSpan={{ sm: 2 }}>
        <LinkButton
          href="https://www.argent.xyz/mobile"
          imageSrc="./assets/onboarding/finish/download-mobile.svg"
          imageWidth={16}
        >
          <Center flex={1} p={4} gap={3} flexDirection="column">
            <L1Bold as="p">Download the mobile app</L1Bold>
            <Button as="div" size="2xs" colorScheme="primary">
              Download
            </Button>
          </Center>
        </LinkButton>
      </GridItem>
      <GridItem>
        <LinkButton
          data-testid="dappland-link"
          href="https://dappland.com"
          label="Explore Starknet apps"
          imageSrc="./assets/onboarding/finish/explore-dapps.svg"
        />
      </GridItem>
      <GridItem>
        <LinkButton
          data-testid="twitter-link"
          href="https://twitter.com/argenthq"
          label="Follow us on X"
          imageSrc="./assets/onboarding/finish/follow-us-on-x.svg"
        />
      </GridItem>
    </Grid>
  )
}
