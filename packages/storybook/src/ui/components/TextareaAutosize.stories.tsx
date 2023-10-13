import { TextareaAutosize, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: TextareaAutosize,
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

export const Address = {
  args: {
    placeholder: "Placeholder",
    value: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  },
}

/** Same stories as Input */

export {
  Default,
  Filled,
  FilledIsInvalid,
  Outline,
  OutlineIsInvalid,
} from "./Input.stories"
