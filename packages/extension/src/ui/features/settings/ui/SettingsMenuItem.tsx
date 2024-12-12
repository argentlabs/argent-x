import { ButtonCell, icons, P3 } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import type { FC, PropsWithChildren, ReactEventHandler } from "react"
import type { LinkProps } from "react-router-dom"
import { Link } from "react-router-dom"

const { ChevronRightSecondaryIcon, MinusPrimaryIcon } = icons

export interface SettingsMenuItemProps extends ButtonProps {
  title: string
  subtitle?: string
}

export const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  rightIcon = <ChevronRightSecondaryIcon />,
  title,
  subtitle,
  ...rest
}) => (
  <ButtonCell rightIcon={rightIcon} width="full" {...rest}>
    <Flex w={"full"} direction={"column"} gap={0.5}>
      <Text overflow={"hidden"} textOverflow={"ellipsis"}>
        {title}
      </Text>
      {subtitle && <P3 color="text-secondary">{subtitle}</P3>}
    </Flex>
  </ButtonCell>
)

export const SettingsMenuItemLink: FC<SettingsMenuItemProps & LinkProps> = (
  props,
) => {
  return <SettingsMenuItem as={Link} {...props} />
}

export interface SettingsMenuItemRemoveProps extends SettingsMenuItemProps {
  onRemoveClick: ReactEventHandler
}

export const SettingsMenuItemRemove: FC<SettingsMenuItemRemoveProps> = ({
  onRemoveClick,
  onClick,
  ...rest
}) => (
  <SettingsMenuItem
    as={Box}
    py={3}
    onClick={onClick}
    rightIcon={
      <Button
        rounded={"full"}
        size={"auto"}
        p={1.5}
        bg="surface-default"
        _hover={{ bg: "neutrals.600" }}
        pointerEvents={"auto"}
        onClick={(e) => {
          e.stopPropagation()
          onRemoveClick(e)
        }}
      >
        <MinusPrimaryIcon fontSize={"base"} />
      </Button>
    }
    _hover={{}}
    _active={{}}
    {...rest}
  />
)

export const SettingsMenuItemGroup: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flex
      w={"full"}
      direction={"column"}
      gap={"1px"}
      sx={{
        "> .chakra-button": {
          _notFirst: {
            roundedTop: "none",
          },
          _notLast: {
            roundedBottom: "none",
          },
        },
      }}
    >
      {children}
    </Flex>
  )
}
