import { icons } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import ReactSelect, {
  ControlProps,
  MenuListProps,
  MenuProps,
  OptionProps,
  SingleValue,
  SingleValueProps,
  ValueContainerProps,
} from "react-select"

import { AccountListItem, AccountListItemProps } from "./AccountListItem"

const { ChevronDownIcon } = icons

const Control = ({
  children,
  innerProps,
  isFocused,
}: ControlProps<AccountListItemProps>) => {
  return (
    <Flex
      {...innerProps}
      backgroundColor={isFocused ? "neutrals.700" : "neutrals.800"}
      rounded={"xl"}
      _hover={{ bg: "neutrals.700" }}
      transitionProperty={"common"}
      transitionDuration={"fast"}
      cursor={"pointer"}
    >
      {children}
    </Flex>
  )
}

const ValueContainer = ({
  children,
}: ValueContainerProps<AccountListItemProps>) => {
  return <>{children}</>
}

const SingleValue = ({ data }: SingleValueProps<AccountListItemProps>) => {
  return (
    <AccountListItem
      {...data}
      width={"full"}
      transparent
      pointerEvents={"none"}
    >
      <ChevronDownIcon />
    </AccountListItem>
  )
}

const IndicatorsContainer = () => {
  return null
}

const Menu = ({ children, innerProps }: MenuProps<AccountListItemProps>) => {
  return (
    <Box
      {...innerProps}
      rounded={"xl"}
      position={"absolute"}
      width={"100%"}
      zIndex={1}
    >
      {children}
    </Box>
  )
}

const MenuList = ({
  children,
  innerProps,
}: MenuListProps<AccountListItemProps>) => {
  return (
    <Box
      {...innerProps}
      rounded={"xl"}
      maxHeight={"300px"}
      overflowY={"auto"}
      position={"relative"}
      boxShadow={"menu"}
    >
      {children}
    </Box>
  )
}

const Option = ({
  innerProps,
  isDisabled,
  isFocused,
  isSelected,
  data,
}: OptionProps<AccountListItemProps>) => {
  if (isDisabled) {
    return null
  }
  return (
    <Box {...innerProps}>
      <AccountListItem
        {...data}
        width={"full"}
        rounded={"none"}
        _active={{
          transform: false,
        }}
        backgroundColor={
          isFocused || isSelected ? "neutrals.600" : "neutrals.800"
        }
      />
    </Box>
  )
}

const components = {
  Control,
  ValueContainer,
  SingleValue,
  IndicatorsContainer,
  Option,
  Menu,
  MenuList,
}

interface AccountSelectProps {
  selectedAccount?: AccountListItemProps
  accounts: AccountListItemProps[]
  onSelectedAccountChange?: (selectedAccount: AccountListItemProps) => void
}

export const AccountSelect: FC<AccountSelectProps> = ({
  selectedAccount,
  accounts = [],
  onSelectedAccountChange,
}) => {
  const onChange = useCallback(
    (option: SingleValue<AccountListItemProps>) => {
      if (onSelectedAccountChange && option) {
        onSelectedAccountChange(option)
      }
    },
    [onSelectedAccountChange],
  )
  return (
    <ReactSelect<AccountListItemProps>
      isSearchable={false}
      defaultValue={selectedAccount}
      options={accounts}
      components={components}
      getOptionLabel={(option) => `${option.accountName}`}
      getOptionValue={(option) => `${option.accountAddress}`}
      onChange={onChange}
    />
  )
}
