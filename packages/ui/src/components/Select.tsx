import {
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { FC, ReactElement, ReactNode, useMemo } from "react"

import { ChevronDownIcon } from "./icons"
import { Input } from "./Input"
import { H6 } from "./Typography"

type Option = {
  icon?: ReactElement
  label: string | ReactNode
  labelSelected: string
  value: string
}

interface SelectProps {
  disabled?: boolean
  emptyMessage?: string
  isInvalid?: boolean
  maxH?: string
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
  maxH,
  name,
  options,
  placeholder,
  onChange,
  value,
}) => {
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value)?.labelSelected || ""
  }, [options, value])

  return (
    <Menu
      matchWidth
      gutter={0}
      flip={false}
      placement="bottom"
      preventOverflow={false}
    >
      <MenuButton
        aria-label={placeholder}
        w="100%"
        type="button"
        disabled={disabled}
      >
        <InputGroup>
          <Input
            name={name}
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

      <MenuList borderRadius={0} overflow="auto" maxH={maxH || "100%"}>
        {options.map(({ icon, label, value: optionValue }) => (
          <MenuItem
            icon={icon || undefined}
            key={optionValue}
            onClick={() => onChange(optionValue)}
            bgColor={optionValue === value ? "neutrals.600" : ""}
            data-group
          >
            {label}
          </MenuItem>
        ))}
        {emptyMessage && options?.length < 1 && (
          <MenuItem disabled>
            <H6 color='"neutrals.100"' py={3}>
              {emptyMessage}
            </H6>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}

export { Select }
