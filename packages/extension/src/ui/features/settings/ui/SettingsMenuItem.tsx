import { ButtonCell, P4, icons } from "@argent/ui"
import { Box, Button, ButtonProps, Flex, Text } from "@chakra-ui/react"
import { FC, PropsWithChildren, ReactEventHandler } from "react"
import { Link, LinkProps } from "react-router-dom"

const { ChevronRightIcon, RemoveIcon } = icons

export interface SettingsMenuItemProps extends ButtonProps {
  title: string
  subtitle?: string
}

export const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  rightIcon = <ChevronRightIcon />,
  title,
  subtitle,
  ...rest
}) => (
  <ButtonCell rightIcon={rightIcon} width="full" {...rest}>
    <Flex w={"full"} direction={"column"} gap={0.5}>
      <Text overflow={"hidden"} textOverflow={"ellipsis"}>
        {title}
      </Text>
      {subtitle && <P4 color="text.secondary">{subtitle}</P4>}
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
        bg={"neutrals.900"}
        _hover={{ bg: "neutrals.600" }}
        pointerEvents={"auto"}
        onClick={(e) => {
          e.stopPropagation()
          onRemoveClick(e)
        }}
      >
        <RemoveIcon fontSize={"base"} />
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
