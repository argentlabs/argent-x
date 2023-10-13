import {
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react"
import { isString } from "lodash-es"
import { FC, ReactElement, ReactNode, useMemo } from "react"

import { ChevronDownIcon } from "./icons"
import { Input } from "./Input"
import { H6 } from "./Typography"

export interface SelectOption {
  icon?: ReactElement
  label: ReactNode
  labelSelected?: string
  value: string
}

export type SelectOptions = SelectOption[]

interface SelectProps {
  emptyMessage?: string
  isDisabled?: boolean
  isInvalid?: boolean
  label?: string
  maxH?: string
  name?: string
  onChange: (e: string) => void
  options: SelectOptions
  placeholder: string
  value: string
}

const Select: FC<SelectProps> = ({
  emptyMessage,
  isDisabled,
  isInvalid,
  label,
  maxH,
  name,
  onChange,
  options,
  placeholder,
  value,
}) => {
  const selectedOptionLabel = useMemo(() => {
    const option = options.find((option) => option.value === value)
    if (option && isString(option.label)) {
      return option.label
    }
  }, [options, value])

  const selectedOptionLabelSelected = useMemo(() => {
    const option = options.find((option) => option.value === value)
    return option?.labelSelected ?? option?.label
  }, [options, value])

  const hasLabel = Boolean(label)

  return (
    <Menu matchWidth gutter={0}>
      <MenuButton
        aria-label={placeholder}
        w="100%"
        type="button"
        disabled={isDisabled}
      >
        <InputGroup>
          <Input
            isInvalid={isInvalid}
            variant={"filled"}
            isDisabled={isDisabled}
            value={hasLabel ? label : selectedOptionLabel}
            placeholder={placeholder}
            name={name}
          />
          <InputRightElement
            w="auto"
            gap={2}
            mr="3"
            display="flex"
            alignItems="center"
            zIndex={0}
            color={isDisabled ? "neutrals.600" : "neutrals.200"}
          >
            {hasLabel && <H6>{selectedOptionLabelSelected ?? placeholder}</H6>}
            <Text>
              <ChevronDownIcon />
            </Text>
          </InputRightElement>
        </InputGroup>
      </MenuButton>

      <MenuList overflow="auto" maxH={maxH || "100%"}>
        {options.map(({ icon, label, value: optionValue }) => (
          <MenuItem
            icon={icon}
            key={optionValue}
            onClick={() => onChange(optionValue)}
            bgColor={optionValue === value ? "neutrals.600" : undefined}
            data-group
          >
            {label}
          </MenuItem>
        ))}
        {emptyMessage && options?.length < 1 && (
          <MenuItem disabled>{emptyMessage}</MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}

export { Select }
