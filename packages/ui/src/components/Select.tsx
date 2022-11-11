import {
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"

import { ChevronDownIcon } from "./icons"
import { Input } from "./Input"
import { B3, H6 } from "./Typography"

type Option = {
  label: string
  value: string
}

interface SelectProps {
  disabled?: boolean
  emptyMessage?: string
  isInvalid?: boolean
  name: string
  onChange: (e: string) => void
  placeholder: string
  options: Option[]
  value: string
}

const Select: FC<SelectProps> = ({
  disabled,
  emptyMessage,
  isInvalid,
  options,
  placeholder,
  onChange,
  value,
  name,
}) => {
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value)?.label || ""
  }, [options, value])

  return (
    <Menu matchWidth isLazy>
      <MenuButton
        aria-label={placeholder}
        w="100%"
        type="button"
        disabled={disabled}
      >
        <InputGroup>
          <Input
            name={name}
            pointerEvents="none"
            _placeholder={{ color: "white" }}
            colorScheme={"neutrals"}
            placeholder={placeholder}
            isInvalid={isInvalid}
          />
          <InputRightElement
            h="100%"
            w="auto"
            gap={2}
            mr="3"
            display="flex"
            alignItems="center"
            zIndex={0}
          >
            <H6 color="neutrals.200">{selectedOption || ""}</H6>
            <Text color="neutrals.200">
              <ChevronDownIcon />
            </Text>
          </InputRightElement>
        </InputGroup>
      </MenuButton>
      <MenuList borderRadius={0}>
        {options.map(({ label, value: optionValue }) => (
          <MenuItem
            key={optionValue}
            onClick={() => onChange(optionValue)}
            bgColor={optionValue === value ? "neutrals.600" : ""}
            data-group
          >
            <B3 color='"neutrals.100"' _groupHover={{ color: "white" }} py={3}>
              {label}
            </B3>
          </MenuItem>
        ))}
        {isEmpty(options) && (
          <MenuItem disabled>
            <B3 color='"neutrals.100"' py={3}>
              {emptyMessage}
            </B3>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}

export { Select }
