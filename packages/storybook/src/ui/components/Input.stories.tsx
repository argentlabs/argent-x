import { Input, icons, theme } from "@argent/ui"
import {
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  VStack,
} from "@chakra-ui/react"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

const { SearchIcon, QrIcon } = icons

export default {
  component: Input,
  render: (props: InputProps) => (
    <VStack spacing={4}>
      <Input {...props} />
      <InputGroup size={props.size}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon />
        </InputLeftElement>
        <Input {...props} />
      </InputGroup>

      <InputGroup size={props.size}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon />
        </InputLeftElement>
        <Input {...props} />
        <InputRightElement>
          <QrIcon />
        </InputRightElement>
      </InputGroup>
    </VStack>
  ),
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Input"),
  },
}

export const Default = {
  args: {
    placeholder: "Placeholder",
  },
}

export const SM = {
  args: {
    ...Default.args,
    size: "sm",
  },
}

export const Filled = {
  args: {
    variant: "filled",
    value: "Lorem ipsum dolor",
  },
}

export const FilledIsInvalid = {
  args: {
    variant: "filled",
    value: "Lorem ipsum dolor",
    isInvalid: true,
  },
}

export const Outline = {
  args: {
    variant: "outline",
    value: "Lorem ipsum dolor",
  },
}

export const OutlineIsInvalid = {
  args: {
    variant: "outline",
    value: "Lorem ipsum dolor",
    isInvalid: true,
  },
}
