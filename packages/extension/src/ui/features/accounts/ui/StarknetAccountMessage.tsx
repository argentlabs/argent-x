import { BarCloseButton, H2, NavigationContainer } from "@argent/x-ui"
import { Box, Circle, Flex, Link } from "@chakra-ui/react"
import type { FC, PropsWithChildren, ReactEventHandler, ReactNode } from "react"

import { typographyStyles } from "@argent/x-ui/theme"

interface StarknetAccountMessageProps extends PropsWithChildren {
  onClose?: ReactEventHandler
  icon: ReactNode
  iconOutlined?: boolean
  footer?: ReactNode
  learnMoreLink?: string
  title?: ReactNode
}

export const StarknetAccountMessage: FC<StarknetAccountMessageProps> = ({
  onClose,
  icon,
  iconOutlined,
  footer,
  learnMoreLink,
  title,
  children,
}) => {
  return (
    <NavigationContainer
      isAbsolute
      rightButton={
        <BarCloseButton
          color={"white"}
          onClick={onClose}
          backgroundColor={"rgba(255,255,255,0.1)"}
          _hover={{
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        />
      }
    >
      <Box
        background={'url("../../../assets/StarknetStars.png")'}
        backgroundColor={"#18185f"}
        h={24}
      />
      <Circle
        position={"absolute"}
        backgroundColor={"black"}
        left={8}
        size={19}
        border={iconOutlined ? "1px solid" : undefined}
        borderColor={iconOutlined ? "white" : undefined}
        top={24}
        transform={"translateY(-50%)"}
        overflow={"hidden"}
      >
        {icon}
      </Circle>
      <Flex flexDirection={"column"} flex={1} px={8} pt={18} pb={8} gap={4}>
        {title && <H2>{title}</H2>}
        {children}
        {learnMoreLink && (
          <Link
            color={"primary.500"}
            href={learnMoreLink}
            target="_blank"
            rel="noreferrer"
            {...typographyStyles.L1Bold}
          >
            Learn more about this change
          </Link>
        )}
        {footer && (
          <>
            <Flex flex={1} />
            {footer}
          </>
        )}
      </Flex>
    </NavigationContainer>
  )
}
